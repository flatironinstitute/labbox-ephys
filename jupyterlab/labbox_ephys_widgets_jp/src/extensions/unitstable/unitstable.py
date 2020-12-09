import labbox_ephys as le


@le.register_sorting_view(name='UnitsTable')
def UnitsTable(*, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor):
    import labbox_ephys_widgets_jp as lew
    return lew.create_sorting_view('UnitsTable', sorting=sorting, recording=recording)
