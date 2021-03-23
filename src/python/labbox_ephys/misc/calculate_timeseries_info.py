import time

import hither2 as hi
import labbox_ephys as le
import numpy as np

from .get_recording_info import geom_from_recording


@hi.function('createjob_calculate_timeseries_info', '0.1.2', register_globally=True)
def createjob_calculate_timeseries_info(labbox, recording_object):
    jh = labbox.get_job_handler('timeseries')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        use_container=jh.is_remote()
    ):
        return calculate_timeseries_info.run(recording_object=recording_object)

@hi.function('calculate_timeseries_info', '0.1.2')
def calculate_timeseries_info(recording_object):
    recording0 = le.LabboxEphysRecordingExtractor(recording_object, download=False)

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
