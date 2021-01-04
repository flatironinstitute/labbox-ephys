import base64
# import time
import io

import hither as hi
import kachery as ka
import labbox_ephys as le
import numpy as np
import spikeextractors as se


@hi.function('createjob_get_recording_info', '0.1.2')
def createjob_get_recording_info(labbox, recording_object):
    jc = labbox.get_default_job_cache()
    with hi.Config(
        job_cache=jc
    ):
        return get_recording_info.run(recording_object=recording_object)

def estimate_noise_level(recording: se.RecordingExtractor):
    N = recording.get_num_frames()
    samplerate = recording.get_sampling_frequency()
    start_frame = 0
    end_frame = int(np.minimum(samplerate * 1, N))
    X = recording.get_traces(channel_ids=[int(id) for id in recording.get_channel_ids()], start_frame=start_frame, end_frame=end_frame)
    est_noise_level = np.median(np.abs(X.squeeze())) / 0.6745  # median absolute deviation (MAD) estimate of stdev
    if (est_noise_level == 0): est_noise_level = 1
    return est_noise_level

@hi.function('get_recording_info', '0.1.6')
@hi.local_modules(['../../labbox_ephys'])
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
@hi.local_modules(['../../labbox_ephys'])
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
def recording_is_downloaded(recording_object):
    recording = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    return recording.is_local()

@hi.function('download_recording', '0.1.0')
@hi.local_modules(['../../labbox_ephys'])
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
def download_recording(recording_object):
    recording = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    recording.download()

@hi.function('createjob_download_recording', '0.1.0')
@hi.local_modules(['../../labbox_ephys'])
def createjob_download_recording(labbox, recording_object):
    return download_recording.run(recording_object=recording_object)

@hi.function('createjob_recording_is_downloaded', '0.1.0')
@hi.local_modules(['../../labbox_ephys'])
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
