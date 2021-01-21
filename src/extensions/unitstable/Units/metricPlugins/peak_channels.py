import os
import hither as hi
import kachery as ka
import numpy as np

from labbox_ephys import prepare_snippets_h5
from labbox_ephys.helpers.get_unit_waveforms import get_unit_waveforms

@hi.function('get_peak_channels', '0.1.0')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def get_peak_channels(snippets_h5):
    import h5py
    h5_path = ka.load_file(snippets_h5)
    ret = {}
    with h5py.File(h5_path, 'r') as f:
        unit_ids = np.array(f.get('unit_ids'))
        for unit_id in unit_ids:
            unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms')) # n x M x T
            channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids')) # n
            peak_channel_index = _compute_peak_channel_index_from_waveforms(unit_waveforms)
            ret[str(unit_id)] = int(channel_ids[peak_channel_index])
    return ret

def _compute_peak_channel_index_from_waveforms(waveforms):
    average_waveform = np.mean(waveforms, axis=0)
    channel_amplitudes = (np.max(average_waveform, axis=1) - np.min(average_waveform, axis=1)).squeeze() # M
    peak_channel_index = np.argmax(channel_amplitudes)
    return peak_channel_index

@hi.function('createjob_get_peak_channels', '')
def createjob_get_peak_channels(labbox, sorting_object, recording_object, configuration={}):
    jh = labbox.get_job_handler('partition1')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object)
        return get_peak_channels.run(
            snippets_h5=snippets_h5
        )