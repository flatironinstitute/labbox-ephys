import labbox_ephys as le


@le.register_sorting_view(name='Curation')
def Curation(*, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor):
    import labbox_ephys_widgets_jp as lew
    return lew.create_sorting_view('CurationSortingView', sorting=sorting, recording=recording)
