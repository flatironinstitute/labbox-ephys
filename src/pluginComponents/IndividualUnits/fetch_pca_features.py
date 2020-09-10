import hither as hi
from labbox_ephys import prepare_snippets_h5
import kachery as ka
import numpy as np

@hi.function('createjob_fetch_pca_features', '0.1.0')
def createjob_fetch_pca_features(labbox, recording_object, sorting_object, unit_id):
    jh = labbox.get_job_handler('partition2')
    jc = labbox.get_default_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object)
        return fetch_pca_features.run(
            snippets_h5=snippets_h5,
            unit_id=unit_id
        )

@hi.function('fetch_pca_features', '0.2.3')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules(['../../../python/labbox_ephys'])
def fetch_pca_features(snippets_h5, unit_id):
    import h5py
    h5_path = ka.load_file(snippets_h5)
    with h5py.File(h5_path, 'r') as f:
        unit_ids = np.array(f.get('unit_ids'))
        sampling_frequency = np.array(f.get('sampling_frequency'))[0]
        unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
        unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms'))
        unit_waveforms_channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
        print(unit_waveforms_channel_ids)

    
    from sklearn.decomposition import PCA

    nf = 2 # number of features

    # list of arrays
    W = unit_waveforms # n x M x T

    # n x MT
    X = W.reshape((W.shape[0], W.shape[1] * W.shape[2]))

    pca = PCA(n_components=nf)
    pca.fit(X)

    features = pca.transform(X) # n x nf

    return dict(
        xfeatures=features[:, 0].squeeze().tolist(),
        yfeatures=features[:, 1].squeeze().tolist()
    )