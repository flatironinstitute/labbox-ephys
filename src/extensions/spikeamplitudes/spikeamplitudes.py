from typing import Dict

import os
import hither as hi
import kachery as ka
import numpy as np
import labbox_ephys as le


@hi.function('createjob_fetch_spike_amplitudes', '0.1.1')
def createjob_fetch_spike_amplitudes(labbox, recording_object, sorting_object, unit_id):
    from labbox_ephys import prepare_snippets_h5
    jh = labbox.get_job_handler('partition1')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object)
        return fetch_spike_amplitudes.run(
            snippets_h5=snippets_h5,
            unit_id=unit_id
        )

def _compute_peak_channel_index_from_average_waveform(average_waveform):
    channel_maxes = np.max(average_waveform, axis=1)
    channel_mins = np.min(average_waveform, axis=1)
    channel_amplitudes = channel_maxes - channel_mins
    peak_channel_index = np.argmax(channel_amplitudes)
    return peak_channel_index

@hi.function('fetch_spike_amplitudes', '0.1.6')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
@le.serialize
def fetch_spike_amplitudes(snippets_h5, unit_id):
    import h5py
    h5_path = ka.load_file(snippets_h5)
    # with h5py.File(h5_path, 'r') as f:
    #     unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
    #     unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms'))    
        
    unit_waveforms, unit_waveforms_channel_ids, channel_locations0, sampling_frequency, unit_spike_train = le.get_unit_waveforms_from_snippets_h5(h5_path, unit_id)
    average_waveform = np.mean(unit_waveforms, axis=0)
    peak_channel_index = _compute_peak_channel_index_from_average_waveform(average_waveform)
    maxs = [np.max(unit_waveforms[i][peak_channel_index, :]) for i in range(unit_waveforms.shape[0])]
    mins = [np.min(unit_waveforms[i][peak_channel_index, :]) for i in range(unit_waveforms.shape[0])]
    peak_amplitudes = np.array([maxs[i] - mins[i] for i in range(len(mins))])

    timepoints = unit_spike_train.astype(np.float32)
    amplitudes = peak_amplitudes.astype(np.float32)

    sort_inds = np.argsort(timepoints)
    timepoints = timepoints[sort_inds]
    amplitudes = amplitudes[sort_inds]
    
    return dict(
        timepoints=timepoints,
        amplitudes=amplitudes
    )
