import hither as hi

@hi.function('get_firing_data', '0.1.2')
@hi.container('docker://magland/labbox-ephys-processing:0.2.18')
@hi.local_modules(['../../../python/labbox_ephys'])
def get_firing_data(sorting_object, recording_object, configuration):
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

@hi.function('createjob_get_firing_data', '')
def createjob_get_firing_data(labbox, sorting_object, recording_object, configuration):
    jh = labbox.get_job_handler('partition3')
    jc = labbox.get_default_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        return get_firing_data.run(
            sorting_object=sorting_object,
            recording_object=recording_object,
            configuration=configuration
        )


def get_structure(sorting_object, recording_object):
    import labbox_ephys as le
    S = le.LabboxEphysSortingExtractor(sorting_object)
    R = le.LabboxEphysRecordingExtractor(recording_object)
    return S, R

