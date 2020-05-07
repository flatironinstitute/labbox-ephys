import hither2 as hi
import numpy as np
import labbox_ephys as le

@hi.function('get_sorting_info', '0.1.0')
def get_sorting_info(sorting_path, recording_path):
    sorting = le.LabboxEphysSortingExtractor(sorting_path)
    recording = le.LabboxEphysRecordingExtractor(recording_path, download=False)
    print(sorting.get_unit_ids())
    print(type(sorting.get_unit_ids()))
    return dict(
        recording_path=recording_path,
        sorting_path=sorting_path,
        unit_ids=_to_int_list(sorting.get_unit_ids()),
        samplerate=recording.get_sampling_frequency()
    )

def _to_int_list(x):
    return np.array(x).astype(int).tolist()
