import hither as hi
import kachery as ka
import labbox_ephys as le
import numpy as np


@le.register_sorting_view(name='IndividualClustersView')
def IndividualClustersView(*, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor):
    import labbox_ephys_widgets_jp as lew
    return lew.create_sorting_view('IndividualClustersView', sorting=sorting, recording=recording)

@hi.function('createjob_individual_cluster_features', '0.1.0')
def createjob_individual_cluster_features(labbox, recording_object, sorting_object, unit_id):
    from labbox_ephys import prepare_snippets_h5
    jh = labbox.get_job_handler('partition2')
    jc = labbox.get_default_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object)
        return individual_cluster_features.run(
            snippets_h5=snippets_h5,
            unit_id=unit_id
        )

@hi.function('individual_cluster_features', '0.1.1')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules(['../../../python/labbox_ephys'])
def individual_cluster_features(snippets_h5, unit_id):
    import h5py
    h5_path = ka.load_file(snippets_h5)
    with h5py.File(h5_path, 'r') as f:
        unit_ids = np.array(f.get('unit_ids'))
        channel_ids = np.array(f.get('channel_ids'))
        channel_locations = np.array(f.get(f'channel_locations'))
        sampling_frequency = np.array(f.get('sampling_frequency'))[0].item()
        unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
        unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms')) # L x M x T
        unit_waveforms_channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
    
    from sklearn.decomposition import PCA
    nf = 2 # number of features
    W = unit_waveforms # L x M x T
    # subtract mean for each channel and waveform
    for i in range(W.shape[0]):
        for m in range(W.shape[1]):
            W[i, m, :] = W[i, m, :] - np.mean(W[i, m, :])
    X = W.reshape((W.shape[0], W.shape[1] * W.shape[2])) # L x MT
    pca = PCA(n_components=nf)
    pca.fit(X)
    features = pca.transform(X) # L x nf

    return dict(
        timepoints=unit_spike_train.tolist(),
        x=features[:, 0].squeeze().tolist(),
        y=features[:, 1].squeeze().tolist(),
    )