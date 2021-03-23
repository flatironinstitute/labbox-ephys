import os
import hither2 as hi
import kachery_p2p as kp
import numpy as np

@hi.function('createjob_get_similar_units', '0.1.0', register_globally=True)
def createjob_get_similar_units(labbox, recording_object, sorting_object):
    from labbox_ephys import prepare_snippets_h5
    jh = labbox.get_job_handler('partition1')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        use_container=jh.is_remote()
    ):
        snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object)
        return get_similar_units.run(
            snippets_h5=snippets_h5
        )

@hi.function(
    'get_similar_units', '0.1.10',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['labbox_ephys']
)
def get_similar_units(snippets_h5):
    import h5py
    h5_path = kp.load_file(snippets_h5, p2p=False)
    assert h5_path is not None
    with h5py.File(h5_path, 'r') as f:
        unit_ids = np.array(f.get('unit_ids'))
        unit_infos = {}
        for unit_id in unit_ids:
            unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms'))
            channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
            average_waveform = np.mean(unit_waveforms, axis=0)
            channel_maximums = np.max(np.abs(average_waveform), axis=1)
            maxchan_index = np.argmax(channel_maximums)
            maxchan_id = int(channel_ids[maxchan_index])
            unit_infos[int(unit_id)] = dict(
                unit_id=unit_id,
                average_waveform=average_waveform,
                channel_ids=channel_ids,
                peak_channel_id=maxchan_id
            )
        ret = {}
        for id1 in unit_ids:
            x = [
                dict(
                    unit_id=id2,
                    similarity=_get_similarity_score(unit_infos[int(id1)], unit_infos[int(id2)])
                )
                for id2 in unit_ids if (id2 != id1)
            ]
            x.sort(key=lambda a: a['similarity'], reverse=True)
            x = [a for a in x if a['similarity'] >= 0.2]
            ret[str(id1)] = x
        return ret

def _get_similarity_score(info1, info2):
    w1 = info1['average_waveform']
    channel_ids1 = info1['channel_ids']
    peak_channel_id1 = info1['peak_channel_id']
    w2 = info2['average_waveform']
    channel_ids2 = info2['channel_ids']
    peak_channel_id2 = info2['peak_channel_id']

    if (peak_channel_id1 in channel_ids2) and (peak_channel_id2 in channel_ids1):
        ind_11 = np.where(channel_ids1 == peak_channel_id1)[0][0]
        ind_12 = np.where(channel_ids1 == peak_channel_id2)[0][0]
        ind_21 = np.where(channel_ids2 == peak_channel_id1)[0][0]
        ind_22 = np.where(channel_ids2 == peak_channel_id2)[0][0]
        w1b = w1[[ind_11, ind_12]]
        w2b = w2[[ind_21, ind_22]]
        return np.corrcoef(w1b.ravel(), w2b.ravel())[0][1]
    else:
        return 0