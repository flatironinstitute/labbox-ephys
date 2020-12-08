import labbox_ephys as le


@le.register_sorting_view(name='ElectrodeGeometry')
def ElectrodeGeometry_sortingview(*, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor):
    import labbox_ephys_widgets_jp as lew
    return lew.create_sorting_view('ElectrodeGeometrySortingView', sorting=sorting, recording=recording)

@le.register_recording_view('ElectrodeGeometry')
def ElectrodeGeometry_recordingview(*, recording: le.LabboxEphysRecordingExtractor):
    import labbox_ephys_widgets_jp as lew
    return lew.create_recording_view('ElectrodeGeometryRecordingView', recording=recording)
