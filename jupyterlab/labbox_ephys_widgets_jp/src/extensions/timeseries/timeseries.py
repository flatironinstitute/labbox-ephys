import labbox_ephys as le


@le.register_recording_view
def Timeseries(*, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor):
    import labbox_ephys_widgets_jp as lew
    return lew.create_sorting_view('TimeseriesView', sorting=sorting, recording=recording)
