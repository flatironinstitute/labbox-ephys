import hither2 as hi
import kachery_p2p as kp
import spikeextractors as se
import numpy as np

from ..extractors import LabboxEphysSortingExtractor, LabboxEphysRecordingExtractor

@hi.function('mountainsort4', '0.1.0')
def mountainsort4(*,
    recording_object,
    detect_sign=-1,
    clip_size=50,
    adjacency_radius=-1,
    detect_threshold=3,
    detect_interval=10,
    num_workers=None,
    verbose=True
):
    from ml_ms4alg.mountainsort4 import MountainSort4
    recording = LabboxEphysRecordingExtractor(recording_object)
    MS4 = MountainSort4()
    MS4.setRecording(recording)
    geom = _get_geom_from_recording(recording)
    MS4.setGeom(geom)
    MS4.setSortingOpts(
        clip_size=clip_size,
        adjacency_radius=adjacency_radius,
        detect_sign=detect_sign,
        detect_interval=detect_interval,
        detect_threshold=detect_threshold,
        verbose=verbose
    )
    if num_workers is not None:
        MS4.setNumWorkers(num_workers)
    with kp.TemporaryDirectory() as tmpdir:
        MS4.setTemporaryDirectory(tmpdir)
        MS4.sort()
        times, labels, channels = MS4.eventTimesLabelsChannels()
        sorting_object = {
            'sorting_format': 'npy1',
            'data': {
                'samplerate': recording.get_sampling_frequency(),
                'times_npy_uri': kp.store_npy(times.astype(np.float64)),
                'labels_npy_uri': kp.store_npy(labels.astype(np.int32))
            }
        }
        return sorting_object
    

def _get_geom_from_recording(recording: se.RecordingExtractor):
    channel_ids=recording.get_channel_ids()
    M=len(channel_ids)
    location0=recording.get_channel_property(channel_ids[0],'location')
    nd=len(location0)
    geom=np.zeros((M,nd))
    for i in range(M):
        location_i=recording.get_channel_property(channel_ids[i],'location')
    geom[i,:]=location_i
    return geom
