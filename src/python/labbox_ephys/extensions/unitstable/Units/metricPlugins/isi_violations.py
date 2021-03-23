import os
import hither2 as hi

@hi.function(
    'get_isi_violation_rates', '0.1.1',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['labbox_ephys']
)
def get_isi_violation_rates(sorting_object, recording_object, configuration={}):
    import labbox_ephys as le
    import spikemetrics as sm
    S = le.LabboxEphysSortingExtractor(sorting_object)
    R = le.LabboxEphysRecordingExtractor(recording_object)

    samplerate = R.get_sampling_frequency()
#    duration_sec = R.get_num_frames() / samplerate

    isi_threshold_msec = configuration.get('isi_threshold_msec', 2.5)
    unit_ids = configuration.get('unit_ids', S.get_unit_ids())

    ret = {}
    for id in unit_ids:
        spike_train = S.get_unit_spike_train(unit_id=id)
        ret[str(id)], _ = sm.metrics.isi_violations( #_ is total violations
            spike_train=spike_train,
            duration=R.get_num_frames(),
            isi_threshold=isi_threshold_msec / 1000 * samplerate
        )
    return ret

@hi.function('createjob_get_isi_violation_rates', '', register_globally=True)
def createjob_get_isi_violation_rates(labbox, sorting_object, recording_object, configuration={}):
    jh = labbox.get_job_handler('partition1')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        use_container=jh.is_remote()
    ):
        return get_isi_violation_rates.run(
            sorting_object=sorting_object,
            recording_object=recording_object,
            configuration=configuration
        )