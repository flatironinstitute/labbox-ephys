import hither as hi
import numpy as np
import kachery as ka
import base64
# import time
import io
import labbox_ephys as le

@hi.function('get_recording_info', '0.1.0')
@hi.local_modules(['../../labbox_ephys'])
@hi.container('docker://magland/labbox-ephys-processing:latest')
def get_recording_info(recording_object):
    recording = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    return dict(
        sampling_frequency=recording.get_sampling_frequency(),
        channel_ids=recording.get_channel_ids(),
        channel_groups=recording.get_channel_groups().tolist(),
        geom=geom_from_recording(recording).tolist(),
        num_frames=recording.get_num_frames(),
        is_local=recording.is_local()
    )

@hi.function('download_recording', '0.1.0')
@hi.local_modules(['../../labbox_ephys'])
@hi.container('docker://magland/labbox-ephys-processing:latest')
def download_recording(recording_object):
    recording = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    recording.download()

def geom_from_recording(recording):
    channel_ids = recording.get_channel_ids()
    location0 = recording.get_channel_property(channel_ids[0], 'location')
    nd = len(location0)
    M = len(channel_ids)
    geom = np.zeros((M, nd))
    for ii in range(len(channel_ids)):
        location_ii = recording.get_channel_property(channel_ids[ii], 'location')
        geom[ii, :] = list(location_ii)
    return geom
