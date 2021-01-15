import os
import hither as hi
import kachery as ka
import numpy as np
from labbox_ephys import prepare_snippets_h5


@hi.function('createjob_fetch_pca_features', '0.1.0')
def createjob_fetch_pca_features(labbox, recording_object, sorting_object, unit_ids):
    jh = labbox.get_job_handler('partition1')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object)
        return fetch_pca_features.run(
            snippets_h5=snippets_h5,
            unit_ids=unit_ids
        )

# def _subsample(x, maxnum):
#     if len(x) <= maxnum:
#         num = len(x)
#     else:
#         num = maxnum
#     indices = np.sort(np.random.RandomState(seed=0).choice(np.arange(len(x)), size=num, replace=False))
#     return x[indices]

@hi.function('fetch_pca_features', '0.3.0')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def fetch_pca_features(snippets_h5, unit_ids):
    import h5py
    h5_path = ka.load_file(snippets_h5)
    with h5py.File(h5_path, 'r') as f:
        sampling_frequency = np.array(f.get('sampling_frequency'))[0].item()
        if np.isnan(sampling_frequency):
            print('WARNING: sampling frequency is nan. Using 30000 for now. Please correct the snippets file.')
            sampling_frequency = 30000
        x = [
            dict(
                unit_id=unit_id,
                unit_waveforms_spike_train=np.array(f.get(f'unit_waveforms/{unit_id}/spike_train')),
                # unit_waveforms_spike_train=_subsample(np.array(f.get(f'unit_spike_trains/{unit_id}')), 1000),
                unit_waveforms=np.array(f.get(f'unit_waveforms/{unit_id}/waveforms')),
                unit_waveforms_channel_ids=np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
            )
            for unit_id in unit_ids
        ]
        channel_ids = _intersect_channel_ids([a['unit_waveforms_channel_ids'] for a in x])
        assert len(channel_ids) > 0, 'No channel ids in intersection'
        for a in x:
            unit_waveforms = a['unit_waveforms']
            unit_waveforms_channel_ids = a['unit_waveforms_channel_ids']
            inds = [np.where(unit_waveforms_channel_ids == ch_id)[0][0] for ch_id in channel_ids]
            a['unit_waveforms_2'] = unit_waveforms[:, inds, :]
            a['labels'] = np.ones((unit_waveforms.shape[0],)) * a['unit_id']
    
    unit_waveforms = np.concatenate([a['unit_waveforms_2'] for a in x], axis=0)
    spike_train = np.concatenate([a['unit_waveforms_spike_train'] for a in x])
    labels = np.concatenate([a['labels'] for a in x]).astype(int)

    from sklearn.decomposition import PCA

    nf = 5 # number of features

    # list of arrays
    W = unit_waveforms # ntot x M x T

    # ntot x MT
    X = W.reshape((W.shape[0], W.shape[1] * W.shape[2]))

    pca = PCA(n_components=nf)
    pca.fit(X)

    features = pca.transform(X) # n x nf

    return dict(
        times=(spike_train / sampling_frequency).tolist(),
        features=[features[:, ii].squeeze().tolist() for ii in range(nf)],
        labels=labels.tolist()
    )

@hi.function('createjob_fetch_spike_waveforms', '0.1.0')
def createjob_fetch_spike_waveforms(labbox, recording_object, sorting_object, unit_ids, spike_indices):
    jh = labbox.get_job_handler('partition1')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object)
        return fetch_spike_waveforms.run(
            snippets_h5=snippets_h5,
            unit_ids=unit_ids,
            spike_indices=spike_indices
        )

@hi.function('fetch_spike_waveforms', '0.1.0')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def fetch_spike_waveforms(snippets_h5, unit_ids, spike_indices):
    import h5py
    h5_path = ka.load_file(snippets_h5)
    spikes = []
    with h5py.File(h5_path, 'r') as f:
        sampling_frequency = np.array(f.get('sampling_frequency'))[0].item()
        if np.isnan(sampling_frequency):
            print('WARNING: sampling frequency is nan. Using 30000 for now. Please correct the snippets file.')
            sampling_frequency = 30000
        for ii, unit_id in enumerate(unit_ids):
            unit_waveforms=np.array(f.get(f'unit_waveforms/{unit_id}/waveforms'))
            unit_waveforms_channel_ids=np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
            unit_waveforms_spike_train=np.array(f.get(f'unit_waveforms/{unit_id}/spike_train'))
            average_waveform = np.mean(unit_waveforms, axis=0)
            channel_maximums = np.max(np.abs(average_waveform), axis=1)
            maxchan_index = np.argmax(channel_maximums)
            maxchan_id = unit_waveforms_channel_ids[maxchan_index]
            for spike_index in spike_indices[ii]:
                spikes.append(dict(
                    unit_id=unit_id,
                    spike_index=spike_index,
                    spike_time=unit_waveforms_spike_train[spike_index],
                    channel_id=maxchan_id,
                    waveform=unit_waveforms[spike_index, maxchan_index, :].squeeze().tolist()
                ))
    return {
        'sampling_frequency': sampling_frequency,
        'spikes': spikes
    }

def _intersect_channel_ids(a):
    ret = a[0]
    for channel_ids in a:
        ret = np.intersect1d(channel_ids, ret)
    return ret
