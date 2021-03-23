import base64
# import time
import io

import os
import hither2 as hi
import labbox_ephys as le


@hi.function(
    'get_recording_object', '0.1.0',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['labbox_ephys']
)
def get_recording_object(recording_path):
    recording = le.LabboxEphysRecordingExtractor(recording_path, download=False)
    return recording.object()

@hi.function('createjob_get_recording_object', '0.1.0', register_globally=True)
def createjob_get_recording_object(labbox, recording_path):
    return get_recording_object.run(recording_path=recording_path)
