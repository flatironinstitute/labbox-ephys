import labbox_ephys as le


@le.register_recording_view('Timeseries')
def Timeseries_recordingview(*, recording: le.LabboxEphysRecordingExtractor):
    import labbox_ephys_widgets_jp as lew
    return lew.create_recording_view('TimeseriesView', recording=recording)

@le.register_sorting_view('Timeseries')
def Timeseries_sortingview(*, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor):
    import labbox_ephys_widgets_jp as lew
    return lew.create_sorting_view('TimeseriesView', sorting=sorting, recording=recording)
