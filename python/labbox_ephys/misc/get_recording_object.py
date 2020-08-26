import hither as hi
import numpy as np
import kachery as ka
import base64
# import time
import io
import labbox_ephys as le

@hi.function('get_recording_object', '0.1.0')
@hi.local_modules(['../../labbox_ephys'])
@hi.container('docker://magland/labbox-ephys-processing:0.2.18')
def get_recording_object(recording_path):
    recording = le.LabboxEphysRecordingExtractor(recording_path, download=False)
    return recording.object()
