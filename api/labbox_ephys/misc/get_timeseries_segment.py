import hither as hi
import numpy as np
import io
import base64
# import time
import labbox_ephys as le

@hi.function('get_timeseries_segment', '0.1.0')
@hi.local_modules(['../../labbox_ephys'])
@hi.container('docker://magland/labbox-ephys-processing:latest')
def get_timeseries_segment(recording_object, ds_factor, segment_num, segment_size):
    import time
    recording0 = le.LabboxEphysRecordingExtractor(recording_object, download=False)

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
        traces_max = np.max(traces_reshaped, axis=2)
        traces = np.zeros((M, N2 * 2))
        traces[:, 0::2] = traces_min
        traces[:, 1::2] = traces_max
    
    data_b64 = _mda32_to_base64(traces)
    # elapsed = time.time() - timer
    return dict(
        data_b64=data_b64
    )

def _mda32_to_base64(X) -> str:
    f = io.BytesIO()
    le.writemda32(X, f)
    return base64.b64encode(f.getvalue()).decode('utf-8')