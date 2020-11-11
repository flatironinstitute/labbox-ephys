from typing import Dict, Union

import hither as hi
import kachery as ka
import numpy as np
import spikeextractors as se


@hi.function('prepare_snippets_h5', '0.2.5')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules(['../../labbox_ephys'])
def prepare_snippets_h5(
    recording_object,
    sorting_object,
    start_frame=None,
    end_frame=None,
    max_events_per_unit=1000,
    max_neighborhood_size=15
):
    if recording_object['recording_format'] == 'snippets1':
        return recording_object['data']['snippets_h5_uri']

    import labbox_ephys as le
    recording = le.LabboxEphysRecordingExtractor(recording_object)
    sorting = le.LabboxEphysSortingExtractor(sorting_object)

    with hi.TemporaryDirectory() as tmpdir:
        save_path = tmpdir + '/snippets.h5'
        prepare_snippets_h5_from_extractors(
            recording=recording,
            sorting=sorting,
            output_h5_path=save_path,
            start_frame=start_frame,
            end_frame=end_frame,
            max_events_per_unit=max_events_per_unit,
            max_neighborhood_size=max_neighborhood_size
        )
        return ka.store_file(save_path)

def _prepare_snippets_h5_from_extractors_helper(
    recording: se.RecordingExtractor,
    sorting: se.SortingExtractor,
    start_frame,
    end_frame,
    max_neighborhood_size: int,
    max_events_per_unit: Union[None, int]=None,
    snippet_len=(50, 80)
):
    from labbox_ephys import (SubsampledSortingExtractor,
                              find_unit_neighborhoods, find_unit_peak_channels,
                              get_unit_waveforms)
    if start_frame is not None:
        recording = se.SubRecordingExtractor(parent_recording=recording, start_frame=start_frame, end_frame=end_frame)
        sorting = se.SubSortingExtractor(parent_sorting=sorting, start_frame=start_frame, end_frame=end_frame)

    unit_ids = sorting.get_unit_ids()
    samplerate = recording.get_sampling_frequency()
    
    # Use this optimized function rather than spiketoolkit's version
    # for efficiency with long recordings and/or many channels, units or spikes
    # we should submit this to the spiketoolkit project as a PR
    print('Subsampling sorting')
    if max_events_per_unit is not None:
        sorting_subsampled = SubsampledSortingExtractor(parent_sorting=sorting, max_events_per_unit=max_events_per_unit, method='random')
    else:
        sorting_subsampled = sorting
    print('Finding unit peak channels')
    peak_channels_by_unit = find_unit_peak_channels(recording=recording, sorting=sorting, unit_ids=unit_ids)
    print('Finding unit neighborhoods')
    channel_ids_by_unit = find_unit_neighborhoods(recording=recording, peak_channels_by_unit=peak_channels_by_unit, max_neighborhood_size=max_neighborhood_size)
    print(f'Getting unit waveforms for {len(unit_ids)} units')
    unit_waveforms = get_unit_waveforms(
        recording=recording,
        sorting=sorting_subsampled,
        unit_ids=unit_ids,
        channel_ids_by_unit=channel_ids_by_unit,
        snippet_len=snippet_len
    )
    return samplerate, unit_ids, unit_waveforms, channel_ids_by_unit, sorting_subsampled

def prepare_snippets_h5_from_extractors(
    recording: se.RecordingExtractor,
    sorting: se.SortingExtractor,
    output_h5_path: str,
    start_frame,
    end_frame,
    max_neighborhood_size: int,
    max_events_per_unit: Union[None, int]=None,
    snippet_len=(50, 80)
):
    import h5py
    samplerate, unit_ids, unit_waveforms, channel_ids_by_unit, sorting_subsampled = _prepare_snippets_h5_from_extractors_helper(
        recording=recording,
        sorting=sorting,
        start_frame=start_frame,
        end_frame=end_frame,
        max_neighborhood_size=max_neighborhood_size,
        max_events_per_unit=max_events_per_unit,
        snippet_len=snippet_len
    )
    save_path = output_h5_path
    with h5py.File(save_path, 'w') as f:
        f.create_dataset('unit_ids', data=np.array(unit_ids).astype(np.int32))
        f.create_dataset('sampling_frequency', data=np.array([samplerate]).astype(np.float64))
        f.create_dataset('channel_ids', data=np.array(recording.get_channel_ids()))
        f.create_dataset('num_frames', data=np.array([recording.get_num_frames()]).astype(np.int32))
        channel_locations = recording.get_channel_locations()
        f.create_dataset(f'channel_locations', data=np.array(channel_locations))
        for ii, unit_id in enumerate(unit_ids):
            x = sorting.get_unit_spike_train(unit_id=unit_id)
            f.create_dataset(f'unit_spike_trains/{unit_id}', data=np.array(x).astype(np.float64))
            f.create_dataset(f'unit_waveforms/{unit_id}/waveforms', data=unit_waveforms[ii].astype(np.float32))
            f.create_dataset(f'unit_waveforms/{unit_id}/channel_ids', data=np.array(channel_ids_by_unit[int(unit_id)]).astype(int))
            f.create_dataset(f'unit_waveforms/{unit_id}/spike_train', data=np.array(sorting_subsampled.get_unit_spike_train(unit_id=unit_id)).astype(np.float64))
            
def prepare_snippets_nwb_from_extractors(
    recording: se.RecordingExtractor,
    sorting: se.SortingExtractor,
    nwb_file_path: str,
    nwb_object_prefix: str,
    start_frame,
    end_frame,
    max_neighborhood_size: int,
    max_events_per_unit: Union[None, int]=None,
    snippet_len=(50, 80),
):
    import pynwb
    samplerate, unit_ids, unit_waveforms, channel_ids_by_unit, sorting_subsampled = _prepare_snippets_h5_from_extractors_helper(
        recording=recording,
        sorting=sorting,
        start_frame=start_frame,
        end_frame=end_frame,
        max_neighborhood_size=max_neighborhood_size,
        max_events_per_unit=max_events_per_unit,
        snippet_len=snippet_len
    )
    # thank you Ryan Ly
    with pynwb.NWBHDF5IO(path=nwb_file_path, mode='a') as io:
        nwbf = io.read()
        nwbf.add_scratch(name=f'{nwb_object_prefix}_unit_ids', data=np.array(unit_ids).astype(np.int32), notes='sorted waveform unit ids')
        nwbf.add_scratch(name=f'{nwb_object_prefix}_sampling_frequency', data=np.array([samplerate]).astype(np.float64), notes='sorted waveform sampling frequency')
        nwbf.add_scratch(name=f'{nwb_object_prefix}_channel_ids', data=np.array(recording.get_channel_ids()), notes='sorted waveform channel ids')
        nwbf.add_scratch(name=f'{nwb_object_prefix}_num_frames', data=np.array([recording.get_num_frames()]).astype(np.int32), notes='sorted waveform number of frames')
        channel_locations = recording.get_channel_locations()
        nwbf.add_scratch(name=f'{nwb_object_prefix}_channel_locations', data=np.array(channel_locations), notes='sorted waveform channel locations')
        for ii, unit_id in enumerate(unit_ids):
            x = sorting.get_unit_spike_train(unit_id=unit_id)
            nwbf.add_scratch(name=f'{nwb_object_prefix}_unit_{unit_id}_spike_trains', data=np.array(x).astype(np.float64), notes=f'sorted spike trains for unit {unit_id}')
            nwbf.add_scratch(name=f'{nwb_object_prefix}_unit_{unit_id}_waveforms', data=unit_waveforms[ii].astype(np.float32), notes=f'sorted waveforms for unit {unit_id}')
            nwbf.add_scratch(name=f'{nwb_object_prefix}_unit_{unit_id}_channel_ids', data=np.array(channel_ids_by_unit[int(unit_id)]).astype(int), notes=f'sorted channel ids for unit {unit_id}')
            nwbf.add_scratch(name=f'{nwb_object_prefix}_unit_{unit_id}_sub_spike_train', data=np.array(sorting_subsampled.get_unit_spike_train(unit_id=unit_id)).astype(np.float64), notes=f'sorted subsampled spike train for unit {unit_id}')
        io.write(nwbf)
    # caveat: The above code working is dependent on a new release of PyNWB/HDMF that would allow the storage of scalars in the scratch space: NeurodataWithoutBorders/pynwb#1309 . This code works on dev versions of nwb_datajoint and labbox-ephys.
