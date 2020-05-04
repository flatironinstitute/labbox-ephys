import hither2 as hi
import numpy as np
import base64
# import time
import io
from .python import LabboxEphysRecordingExtractor
from .python import writemda32

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

@hi.function('calculate_timeseries_info', '0.1.0')
def calculate_timeseries_info(recording):
    recording0 = LabboxEphysRecordingExtractor(recording, download=False)

    traces0 = recording0.get_traces(
        channel_ids=recording0.get_channel_ids(),
        start_frame=0, end_frame=min(recording0.get_num_frames(), 25000
    ))
    y_offsets = -np.mean(traces0, axis=1)
    for m in range(traces0.shape[0]):
        traces0[m, :] = traces0[m, :] + y_offsets[m]
    vv = np.percentile(np.abs(traces0), 90)
    y_scale_factor = 1 / (2 * vv) if vv > 0 else 1

    # segment_size_times_num_channels = 1000000
    segment_size_times_num_channels = 100000
    segment_size = int(np.ceil(segment_size_times_num_channels / recording0.get_num_channels()))

    return dict(
        samplerate=recording0.get_sampling_frequency(),
        num_channels=len(recording0.get_channel_ids()),
        channel_ids=recording0.get_channel_ids(),
        channel_locations=geom_from_recording(recording0).tolist(),
        num_timepoints=recording0.get_num_frames(),
        y_offsets=y_offsets.astype(float).tolist(),
        y_scale_factor=float(y_scale_factor),
        initial_y_scale_factor=1,
        segment_size=segment_size
    )

@hi.function('get_timeseries_segment', '0.1.0')
def get_timeseries_segment(recording, ds_factor, segment_num, segment_size):
    # timer = time.time()
    recording0 = LabboxEphysRecordingExtractor(recording, download=False)

    t1 = segment_num * segment_size * ds_factor
    t2 = ((segment_num + 1) * segment_size * ds_factor)
    if t2 > recording0.get_num_frames():
        t2 = int(recording0.get_num_frames() / ds_factor) * ds_factor
    traces = recording0.get_traces(
        start_frame=t1,
        end_frame=t2
    )
    M = traces.shape[0]
    N = traces.shape[1]
    if ds_factor > 1:
        N2 = int(N / ds_factor)
        traces_reshaped = traces.reshape((M, N2, ds_factor))
        traces_min = np.min(traces_reshaped, axis=2)
        traces_max = np.min(traces_reshaped, axis=2)
        traces = np.zeros((M, N2 * 2))
        traces[:, 0::2] = traces_min
        traces[:, 1::2] = traces_max
    
    data_b64 = _mda32_to_base64(traces)
    # elapsed = time.time() - timer
    return dict(
        data_b64=data_b64
    )

def _mda32_to_base64(X):
    f = io.BytesIO()
    writemda32(X, f)
    return base64.b64encode(f.getvalue()).decode('utf-8')