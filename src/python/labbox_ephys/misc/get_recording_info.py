import base64
# import time
import io

import os
import hither as hi
import kachery as ka
import labbox_ephys as le
import numpy as np
import spikeextractors as se


@hi.function('createjob_get_recording_info', '0.1.2')
def createjob_get_recording_info(labbox, recording_object):
    jc = labbox.get_job_cache()
    jh = labbox.get_job_handler('partition1')
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        return get_recording_info.run(recording_object=recording_object)

def estimate_noise_level(recording: se.RecordingExtractor):
    N = recording.get_num_frames()
    samplerate = recording.get_sampling_frequency()
    start_frame = 0
    end_frame = int(np.minimum(samplerate * 1, N))
    X = recording.get_traces(channel_ids=[int(id) for id in recording.get_channel_ids()], start_frame=start_frame, end_frame=end_frame)
    X_mean_subtracted = _mean_subtract_on_channels(X)
    est_noise_level = np.median(np.abs(X_mean_subtracted.squeeze())) / 0.6745  # median absolute deviation (MAD) estimate of stdev
    if (est_noise_level == 0): est_noise_level = 1
    return est_noise_level

def _mean_subtract_on_channels(X: np.ndarray):
    return X - np.broadcast_to(np.mean(X, axis=1), (X.shape[1], X.shape[0])).T

@hi.function('get_recording_info', '0.1.7')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
def get_recording_info(recording_object):
    recording = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    return dict(
        sampling_frequency=recording.get_sampling_frequency(),
        channel_ids=recording.get_channel_ids(),
        channel_groups=recording.get_channel_groups().tolist(),
        geom=geom_from_recording(recording).tolist(),
        num_frames=recording.get_num_frames(),
        noise_level=estimate_noise_level(recording)
    )

@hi.function('recording_is_downloaded', '0.1.0')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
def recording_is_downloaded(recording_object):
    recording = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    return recording.is_local()

@hi.function('download_recording', '0.1.0')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
def download_recording(recording_object):
    recording = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    recording.download()

@hi.function('createjob_download_recording', '0.1.0')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def createjob_download_recording(labbox, recording_object):
    return download_recording.run(recording_object=recording_object)

@hi.function('createjob_recording_is_downloaded', '0.1.0')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def createjob_recording_is_downloaded(labbox, recording_object):
    return recording_is_downloaded.run(recording_object=recording_object)


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
