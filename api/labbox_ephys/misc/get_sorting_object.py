import hither as hi
import numpy as np
import kachery as ka
import base64
# import time
import io
import labbox_ephys as le

@hi.function('get_sorting_object', '0.1.0')
@hi.local_modules(['../../labbox_ephys'])
@hi.container('docker://magland/labbox-ephys-processing:latest')
def get_sorting_object(sorting_path, recording_object):
    recording = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    sorting = le.LabboxEphysSortingExtractor(sorting_path, samplerate=recording.get_sampling_frequency())
    return sorting.object()
