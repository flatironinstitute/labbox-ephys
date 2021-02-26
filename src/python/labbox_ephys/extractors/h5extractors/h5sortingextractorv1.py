# import h5py
import warnings

import numpy as np
from spikeextractors import SortingExtractor

warnings.simplefilter(action='ignore', category=FutureWarning)
import h5py

warnings.resetwarnings()

class H5SortingExtractorV1(SortingExtractor):
    def __init__(self, h5_path):
        SortingExtractor.__init__(self)
        self._h5_path = h5_path
        self._loaded_spike_trains = {}

        with h5py.File(self._h5_path, 'r') as f:
            self._unit_ids = np.array(f.get('unit_ids'))
            self._sampling_frequency = np.array(f.get('sampling_frequency'))[0].item()
            if np.isnan(self._sampling_frequency):
                print('WARNING: sampling frequency is nan. Using 30000 for now. Please correct the snippets file.')
                self._sampling_frequency = 30000

    def get_unit_ids(self):
        return self._unit_ids.tolist()

    def get_unit_spike_train(self, unit_id, start_frame=None, end_frame=None):
        if unit_id not in self._loaded_spike_trains:
            with h5py.File(self._h5_path, 'r') as f:
                self._loaded_spike_trains[unit_id] = np.array(f.get(f'unit_spike_trains/{unit_id}'))

        x = self._loaded_spike_trains[unit_id]

        if start_frame is None:
            start_frame = 0
        
        if (start_frame == 0) and (end_frame is None):
            return x
        
        assert end_frame is not None

        return np.array([t for t in x if ((start_frame <= t) and (t < end_frame))])

    def get_sampling_frequency(self):
        return self._sampling_frequency

    @staticmethod
    def write_sorting(sorting, save_path):
        unit_ids = sorting.get_unit_ids()
        samplerate = sorting.get_sampling_frequency()
        with h5py.File(save_path, 'w') as f:
            f.create_dataset('unit_ids', data=np.array(unit_ids).astype(np.int32))
            f.create_dataset('sampling_frequency', data=np.array([samplerate]).astype(np.float64))
            for unit_id in unit_ids:
                x = sorting.get_unit_spike_train(unit_id=unit_id)
                f.create_dataset(f'unit_spike_trains/{unit_id}', data=np.array(x).astype(np.float64))
