import hither as hi
import numpy as np
import labbox_ephys as le

@hi.function('get_sorting_info', '0.1.0')
def get_sorting_info(sorting_object, recording_object):
    sorting = le.LabboxEphysSortingExtractor(sorting_object)
    recording = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    return dict(
        unit_ids=_to_int_list(sorting.get_unit_ids()),
        samplerate=recording.get_sampling_frequency()
    )

def _to_int_list(x):
    return np.array(x).astype(int).tolist()
