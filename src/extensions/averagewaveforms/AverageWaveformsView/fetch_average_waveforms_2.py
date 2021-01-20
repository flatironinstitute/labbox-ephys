from typing import Dict

import os
import hither as hi
import kachery as ka
import numpy as np
import labbox_ephys as le


@hi.function('createjob_fetch_average_waveform_2', '0.1.1')
def createjob_fetch_average_waveform_2(labbox, recording_object, sorting_object, unit_id, visible_channel_ids):
    from labbox_ephys import prepare_snippets_h5
    jh = labbox.get_job_handler('partition1')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object)
        return fetch_average_waveform_2.run(
            snippets_h5=snippets_h5,
            unit_id=unit_id,
            visible_channel_ids=visible_channel_ids
        )

@hi.function('fetch_average_waveform_2', '0.2.8')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def fetch_average_waveform_2(snippets_h5, unit_id, visible_channel_ids):
    import h5py
    h5_path = ka.load_file(snippets_h5)
    with h5py.File(h5_path, 'r') as f:
        unit_ids = np.array(f.get('unit_ids'))
        channel_ids = np.array(f.get('channel_ids'))
        channel_locations = np.array(f.get(f'channel_locations'))
        sampling_frequency = np.array(f.get('sampling_frequency'))[0].item()
        if np.isnan(sampling_frequency):
            print('WARNING: sampling frequency is nan. Using 30000 for now. Please correct the snippets file.')
            sampling_frequency = 30000
        unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
        unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms'))
        unit_waveforms_channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))

        if visible_channel_ids is not None:
            inds = [ii for ii in range(len(unit_waveforms_channel_ids)) if unit_waveforms_channel_ids[ii] in visible_channel_ids]
            unit_waveforms_channel_ids = unit_waveforms_channel_ids[inds]
            unit_waveforms = unit_waveforms[:, inds, :]

        print(unit_waveforms_channel_ids)
    
    average_waveform = np.mean(unit_waveforms, axis=0)
    channel_locations0 = []
    for ch_id in unit_waveforms_channel_ids:
        ind = np.where(channel_ids == ch_id)[0]
        channel_locations0.append(channel_locations[ind, :].ravel().tolist())

    return dict(
        average_waveform=average_waveform.astype(np.float32),
        channel_ids=unit_waveforms_channel_ids.astype(np.int32),
        channel_locations=channel_locations0,
        sampling_frequency=sampling_frequency
    )
