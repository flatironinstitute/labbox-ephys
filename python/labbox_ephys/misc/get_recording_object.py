import base64
# import time
import io

import os
import hither as hi
import kachery as ka
import labbox_ephys as le
import numpy as np


@hi.function('get_recording_object', '0.1.0')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
def get_recording_object(recording_path):
    recording = le.LabboxEphysRecordingExtractor(recording_path, download=False)
    return recording.object()

@hi.function('createjob_get_recording_object', '0.1.0')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def createjob_get_recording_object(labbox, recording_path):
    return get_recording_object.run(recording_path=recording_path)
