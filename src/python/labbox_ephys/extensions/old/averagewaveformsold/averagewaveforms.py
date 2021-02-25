import labbox_ephys as le


@le.register_sorting_view()
def AverageWaveforms(*, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor):
    import labbox_ephys_widgets_jp as lew
    return lew.create_sorting_view('AverageWaveforms', sorting=sorting, recording=recording)
