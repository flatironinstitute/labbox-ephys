import base64
# import time
import io

import os
import hither2 as hi
import labbox_ephys as le


@hi.function(
    'get_sorting_object', '0.1.0',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['labbox_ephys']
)
def get_sorting_object(sorting_path, recording_object):
    recording = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    sorting = le.LabboxEphysSortingExtractor(sorting_path, samplerate=recording.get_sampling_frequency())
    return sorting.object()

@hi.function('createjob_get_sorting_object', '0.1.0', register_globally=True)
def createjob_get_sorting_object(labbox, sorting_path, recording_object):
    return get_sorting_object.run(sorting_path=sorting_path, recording_object=recording_object)
