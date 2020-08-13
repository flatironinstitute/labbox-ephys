import hither as hi
import numpy as np
import kachery as ka
import spikeextractors as se
import spiketoolkit as st

@hi.function('fetch_average_waveform_plot_data', '0.1.12')
def fetch_average_waveform_plot_data(recording_object, sorting_object, unit_id):
    import labbox_ephys as le
    R = le.LabboxEphysRecordingExtractor(recording_object)
    S = le.LabboxEphysSortingExtractor(sorting_object)

    start_frame = 0
    end_frame = R.get_sampling_frequency() * 30
    R0 = se.SubRecordingExtractor(parent_recording=R, start_frame=start_frame, end_frame=end_frame)
    S0 = se.SubSortingExtractor(parent_sorting=S, start_frame=start_frame, end_frame=end_frame)

    times0 = S0.get_unit_spike_train(unit_id=unit_id)
    if len(times0) == 0:
        # no waveforms found
        return dict(
            channel_id=None,
            average_waveform = None
        )
    try:
        average_waveform = st.postprocessing.get_unit_templates(
            recording=R0,
            sorting=S0,
            unit_ids=[unit_id]
        )[0]
    except:
        raise Exception(f'Error getting unit templates for unit {unit_id}')

    channel_maximums = np.max(np.abs(average_waveform), axis=1)
    maxchan_index = np.argmax(channel_maximums)
    maxchan_id = R0.get_channel_ids()[maxchan_index]

    return dict(
        channel_id=maxchan_id,
        average_waveform=average_waveform[maxchan_id, :].tolist()
    )