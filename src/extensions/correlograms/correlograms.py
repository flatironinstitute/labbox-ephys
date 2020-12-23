import labbox_ephys as le


@le.register_sorting_view()
def Autocorrelograms(*, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor):
    import labbox_ephys_widgets_jp as lew
    return lew.create_sorting_view('Autocorrelograms', sorting=sorting, recording=recording)

@le.register_sorting_view()
def CrossCorrelograms(*, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor):
    import labbox_ephys_widgets_jp as lew
    return lew.create_sorting_view('CrossCorrelograms', sorting=sorting, recording=recording)
