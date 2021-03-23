import os
import hither2 as hi
import kachery_p2p as kp
import numpy as np

from labbox_ephys import prepare_snippets_h5
from labbox_ephys.helpers.get_unit_waveforms import get_unit_waveforms

@hi.function(
    'get_unit_snrs', '0.1.0',
    image=hi.RemoteDockerImage('docker://magland/labbox-ephys-processing:0.3.19'),
    modules=['labbox_ephys']
)
def get_unit_snrs(snippets_h5):
    import h5py
    h5_path = kp.load_file(snippets_h5, p2p=False)
    assert h5_path is not None
    ret = {}
    with h5py.File(h5_path, 'r') as f:
        unit_ids = np.array(f.get('unit_ids'))
        for unit_id in unit_ids:
            unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms')) # n x M x T
            ret[str(unit_id)] = _compute_unit_snr_from_waveforms(unit_waveforms)
    return ret

def _compute_unit_snr_from_waveforms(waveforms):
    average_waveform = np.mean(waveforms, axis=0)
    channel_amplitudes = (np.max(average_waveform, axis=1) - np.min(average_waveform, axis=1)).squeeze() # M
    peak_channel_index = np.argmax(channel_amplitudes)
    mean_subtracted_waveforms_on_peak_channel = waveforms[:, peak_channel_index, :] - average_waveform[peak_channel_index]
    est_noise_level = np.median(np.abs(mean_subtracted_waveforms_on_peak_channel.squeeze())) / 0.6745  # median absolute deviation (MAD) estimate of stdev
    peak_channel_amplitude = channel_amplitudes[peak_channel_index]
    snr = peak_channel_amplitude / est_noise_level
    return snr

@hi.function('createjob_get_unit_snrs', '', register_globally=True)
def createjob_get_unit_snrs(labbox, sorting_object, recording_object, configuration={}):
    jh = labbox.get_job_handler('partition1')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        use_container=jh.is_remote()
    ):
        snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object)
        return get_unit_snrs.run(
            snippets_h5=snippets_h5
        )