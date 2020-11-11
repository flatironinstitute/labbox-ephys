from typing import List, Set, Union

import kachery_p2p as kp
import numpy as np
import spikeextractors as se


class Snippets1NwbSortingExtractor(se.SortingExtractor):
    extractor_name = 'Snippets1NwbSortingExtractor'
    is_writable = False
    def __init__(self, *, snippets_nwb_uri: str, nwb_object_prefix: str, p2p: bool=False):
        import pynwb
        se.RecordingExtractor.__init__(self)

        snippets_nwb_path = kp.load_file(snippets_nwb_uri, p2p=p2p)
        
        self._snippets_nwb_path: str = snippets_nwb_path

        channel_ids_set: Set[int] = set()
        max_timepoint: int = 0
        with pynwb.NWBHDF5IO(path=self._snippets_nwb_path, mode='r') as io:
            nwbf = io.read()
            sampling_frequency: float = np.array(nwbf.get_scratch(f'{nwb_object_prefix}_sampling_frequency'))[0]
            if np.isnan(sampling_frequency):
                print('WARNING: sampling frequency is nan. Using 30000 for now. Please correct the snippets file.')
                sampling_frequency = 30000
            self.set_sampling_frequency(sampling_frequency)
            # todo: fix the following line
            self._unit_ids: List[int] = np.array(f.get('unit_ids')).astype(int).tolist()
            for unit_id in self._unit_ids:
                # todo: fix the following line
                unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
                max_timepoint = int(max(max_timepoint, np.max(unit_spike_train)))
                # unit_waveforms = np.array(f.get(f'unit_waveforms/{unit_id}/waveforms'))
                # todo: fix the following line
                unit_waveforms_channel_ids = np.array(f.get(f'unit_waveforms/{unit_id}/channel_ids'))
                for id in unit_waveforms_channel_ids:
                    channel_ids_set.add(int(id))
        self._channel_ids: List[int] = sorted(list(channel_ids_set))
        self._num_frames: int = max_timepoint + 1

    def get_unit_ids(self) -> List[int]:
        return self._unit_ids

    def get_unit_spike_train(self, unit_id: int, start_frame: Union[None, int], end_frame: Union[None, int]) -> int:
        import pynwb
        with pynwb.NWBHDF5IO(path=self._snippets_nwb_path, mode='r') as io:
            nwbf = io.read()
            # todo: fix the following line
            unit_spike_train = np.array(f.get(f'unit_spike_trains/{unit_id}'))
            if start_frame is not None:
                assert end_frame is not None
                return unit_spike_train[(start_frame <= unit_spike_train) & (unit_spike_train < end_frame)]
            else:
                return unit_spike_train

    def get_traces(self, channel_ids=None, start_frame=None, end_frame=None):
        if start_frame is None:
            start_frame = 0
        if end_frame is None:
            end_frame = self._num_frames
        if channel_ids is None:
            channel_ids = self._channel_ids
        M = len(channel_ids)
        N = end_frame - start_frame

        # For now, just return zeros
        return np.zeros((M, N))
