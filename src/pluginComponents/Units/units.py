import hither as hi

@hi.function('get_firing_data', '0.1.0')
def get_firing_data(sorting_object, recording_object):
    from decimal import Decimal
    S, R = get_structure(sorting_object, recording_object)
    elapsed = R.get_num_frames()/R.get_sampling_frequency()
    ids = S.get_unit_ids()
    train = [S.get_unit_spike_train(id).size for id in ids]
    keyedCount = dict(zip(
        [id for id in ids],
        [{'count': t,
          'rate': f"{Decimal(t / elapsed).quantize(Decimal('.01'))}"} for t in train]))
    return keyedCount


def get_structure(sorting_object, recording_object):
    import labbox_ephys as le
    S = le.LabboxEphysSortingExtractor(sorting_object)
    R = le.LabboxEphysRecordingExtractor(recording_object)
    return S, R

