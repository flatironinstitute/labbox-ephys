import h5py
import kachery as ka
import labbox_ephys as le
import numpy as np
import spikeextractors as se

# Prepare recording, sorting extractors using any method
recording, sorting = se.example_datasets.toy_example()

# Specify the output path
output_h5_path = 'test_snippets.h5'

# Prepare the snippets h5 file
le.prepare_snippets_h5_from_extractors(
    recording=recording,
    sorting=sorting,
    output_h5_path=output_h5_path,
    start_frame=None,
    end_frame=None,
    max_events_per_unit=1000,
    max_neighborhood_size=2
)

# Example display some contents of the file
with h5py.File(output_h5_path, 'r') as f:
    unit_ids = np.array(f.get('unit_ids'))
    sampling_frequency = np.array(f.get('sampling_frequency'))[0].item()
    if np.isnan(sampling_frequency):
        print('WARNING: sampling frequency is nan. Using 30000 for now. Please correct the snippets file.')
        sampling_frequency = 30000
    print(f'Unit IDs: {unit_ids}')
    print(f'Sampling freq: {sampling_frequency}')
    for unit_id in unit_ids:
        unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
        unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms'))
        unit_waveforms_channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
        print(f'Unit {unit_id} | Tot num events: {len(unit_spike_train)} | shape of subsampled snippets: {unit_waveforms.shape}')

recording = le.LabboxEphysRecordingExtractor({
    'recording_format': 'snippets1',
    'data': {
        'snippets_h5_uri': ka.store_file(output_h5_path)
    }
})
print(f'Channel IDs: {recording.get_channel_ids()}')
print(f'Num. frames: {recording.get_num_frames()}')
for channel_id in recording.get_channel_ids():
    print(f'Channel {channel_id}: {recording.get_channel_property(channel_id, "location")}')
