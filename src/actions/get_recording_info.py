import hither2 as hi
import numpy as np
from .python import LabboxEphysRecordingExtractor

@hi.function('get_recording_info', '0.1.0')
def get_recording_info(recording_path):
    recording = LabboxEphysRecordingExtractor(recording_path, download=False)
    return dict(
        recording_path=recording_path,
        sampling_frequency=recording.get_sampling_frequency(),
        channel_ids=recording.get_channel_ids(),
        channel_groups=recording.get_channel_groups(),
        geom=geom_from_recording(recording).tolist(),
        num_frames=recording.get_num_frames()
    )

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
