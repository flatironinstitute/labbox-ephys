from typing import Dict, List, Union

import os
import hither as hi
import kachery as ka
import numpy as np
import labbox_ephys as le


@hi.function('createjob_fetch_average_waveform_2', '0.1.1')
def createjob_fetch_average_waveform_2(labbox, recording_object, sorting_object, unit_id):
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
            unit_id=unit_id
        )

@hi.function('fetch_average_waveform_2', '0.2.14')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
@le.serialize
def fetch_average_waveform_2(snippets_h5, unit_id):
    import h5py
    h5_path = ka.load_file(snippets_h5)
    unit_waveforms, unit_waveforms_channel_ids, channel_locations0, sampling_frequency, unit_spike_train = le.get_unit_waveforms_from_snippets_h5(h5_path, unit_id)
    
    average_waveform = np.mean(unit_waveforms, axis=0)

    return dict(
        average_waveform=average_waveform.astype(np.float32),
        channel_ids=unit_waveforms_channel_ids.astype(np.int32),
        channel_locations=channel_locations0.astype(np.float32),
        sampling_frequency=sampling_frequency
    )
