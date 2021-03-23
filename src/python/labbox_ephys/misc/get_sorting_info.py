import os
import hither2 as hi
import kachery_p2p as kp
import labbox_ephys as le
import numpy as np


@hi.function('createjob_get_sorting_info', '0.1.0', register_globally=True)
def createjob_get_sorting_info(labbox, sorting_object, recording_object):
    jc = labbox.get_job_cache()
    jh = labbox.get_job_handler('partition1')
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        use_container=jh.is_remote()
    ):
        return get_sorting_info.run(sorting_object=sorting_object, recording_object=recording_object)

@hi.function(
    'get_sorting_info', '0.1.0',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['labbox_ephys']
)
def get_sorting_info(sorting_object, recording_object):
    sorting = le.LabboxEphysSortingExtractor(sorting_object)
    recording = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    return dict(
        unit_ids=_to_int_list(sorting.get_unit_ids()),
        samplerate=recording.get_sampling_frequency()
    )

@hi.function('fetch_external_sorting_unit_metrics', '0.1.0')
def fetch_external_sorting_unit_metrics(labbox, uri):
    return load_object.run(uri=uri)

@hi.function('load_object', '0.1.0')
def load_object(uri):
    return kp.load_object(uri)

def _to_int_list(x):
    return np.array(x).astype(int).tolist()
