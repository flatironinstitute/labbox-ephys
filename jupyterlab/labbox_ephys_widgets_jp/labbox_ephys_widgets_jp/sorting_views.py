import labbox_ephys as le

from .create_sorting_view import create_sorting_view


def AverageWaveformsNew(*, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor):
    return create_sorting_view('AverageWaveformsNew', sorting=sorting, recording=recording)
