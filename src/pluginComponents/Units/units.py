import hither as hi
import numpy as np

@hi.function('get_firing_data', '0.1.0')
def get_firing_data(sorting_object, recording_object):
    S, R = get_structure(sorting_object, recording_object)
    elapsed = R.get_num_frames()/R.get_sampling_frequency()
    ids = S.get_unit_ids()
    train = [S.get_unit_spike_train(id).size for id in ids]
    keyedCount = dict(zip([id.item() for id in ids], [{'count': t, 'rate': t / elapsed} for t in train]))
    # print(f"Train: {train}")
    # print(f"Keyed count: {keyedCount}")

    return keyedCount


def get_structure(sorting_object, recording_object):
    import labbox_ephys as le
    S = le.LabboxEphysSortingExtractor(sorting_object)
    R = le.LabboxEphysRecordingExtractor(recording_object)
    # print(f"\tSorting:\n{S}")
    # print(f"\tRecording:\n{R}")
    return S, R

