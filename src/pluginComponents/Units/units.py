import hither as hi

@hi.function('get_firing_data', '0.1.2')
@hi.container('docker://magland/labbox-ephys-processing:0.2.18')
@hi.local_modules(['../../../python/labbox_ephys'])
def get_firing_data(sorting_object, recording_object):
    from decimal import Decimal
    S, R = get_structure(sorting_object, recording_object)
    elapsed = R.get_num_frames()/R.get_sampling_frequency()
    ids = S.get_unit_ids()
    train = [S.get_unit_spike_train(id).size for id in ids]
    keyedCount = dict(zip(
        [str(id) for id in ids],
        [{'count': t,
          'rate': f"{Decimal(t / elapsed).quantize(Decimal('.01'))}"} for t in train]))
    return keyedCount


def get_structure(sorting_object, recording_object):
    import labbox_ephys as le
    S = le.LabboxEphysSortingExtractor(sorting_object)
    R = le.LabboxEphysRecordingExtractor(recording_object)
    return S, R

