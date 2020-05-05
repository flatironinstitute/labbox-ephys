import labbox_ephys as le
import hither2 as hi
import kachery as ka

@hi.function('run_spike_sorting', '0.1.0')
def run_spike_sorting(recording: dict, sorter: dict):
    # # make sure that we have the recording downloaded to the local machine
    # le.LabboxEphysRecordingExtractor(recording, download=True)

    algorithm = sorter['algorithm']
    sorting_params = sorter.get('sorting_params', dict())
    assert hasattr(le.sorters, algorithm), f'Algorithm not found: {algorithm}'
    sorter0 = getattr(le.sorters, algorithm)

    result = sorter0(
        recording=recording,
        **sorting_params
    )
    return result