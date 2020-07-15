from copy import deepcopy
from typing import Union
import kachery as ka
import kachery_p2p as kp
import hither as hi
import spikeextractors as se
from .mdaextractors import MdaSortingExtractor

def _path(x):
    if type(x) is str:
        return x
    elif isinstance(x, hi.File):
        return x.path
    else:
        raise Exception('Cannot get path from:', x)

def _try_mda_create_object(arg: Union[str, dict], samplerate=None) -> Union[None, dict]:
    if isinstance(arg, str):
        path = arg
        if not ka.get_file_info(path):
            return None
        return dict(
            sorting_format='mda',
            data=dict(
                firings=path,
                samplerate=samplerate
            )
        )
    
    if isinstance(arg, dict):
        if 'firings' in arg:
            return dict(
                recording_format='mda',
                data=dict(
                    firings=arg['firings'],
                    samplerate=arg.get('samplerate', None)
                )
            )
    
    return None

def _create_object_for_arg(arg: Union[str, dict], samplerate=None) -> Union[dict, None]:
    # check to see if it already has the sorting_format field. If so, just return arg
    if (isinstance(arg, dict)) and ('sorting_format' in arg):
        return arg

    # if has form dict(path='...') then replace by the string
    if (isinstance(arg, dict)) and ('path' in arg) and (type(arg['path']) == str):
        arg = arg['path']

    # if has type LabboxEphysRecordingExtractor, then just get the object from arg.object()
    if isinstance(arg, LabboxEphysSortingExtractor):
        return arg.object()

    # if arg is a string ending with .json then replace arg by the object
    if (isinstance(arg, str)) and (arg.endswith('.json')):
        path = arg
        arg = kp.load_object(path)
        if arg is None:
            raise Exception(f'Unable to load object: {path}')
    
    # See if it has format 'mda'
    obj = _try_mda_create_object(arg, samplerate=samplerate)
    if obj is not None:
        return obj
    
    return None    

class LabboxEphysSortingExtractor(se.SortingExtractor):
    def __init__(self, arg, samplerate=None):
        super().__init__()
        if (isinstance(arg, dict)) and ('sorting_format' in arg):
            obj = dict(arg)
        else:
            obj = _create_object_for_arg(arg, samplerate=samplerate)
            assert obj is not None, f'Unable to create sorting from arg: {arg}'
        self._object: dict = obj

        sorting_format = self._object['sorting_format']
        data: dict = self._object['data']
        if sorting_format == 'mda':
            firings_path = kp.load_file(data['firings'])
            assert firings_path is not None, f'Unable to load firings file: {data["firings"]}'
            self._sorting: se.SortingExtractor = MdaSortingExtractor(firings_file=firings_path, samplerate=data['samplerate'])
        else:
            raise Exception(f'Unexpected sorting format: {sorting_format}')

        self.copy_unit_properties(sorting=self._sorting)
    
    def object(self):
        return deepcopy(self._object)
    
    def hash(self) -> str:
        return ka.get_object_hash(self.object())

    def get_unit_ids(self):
        return self._sorting.get_unit_ids()

    def get_unit_spike_train(self, unit_id, start_frame=None, end_frame=None):
        return self._sorting.get_unit_spike_train(unit_id=unit_id, start_frame=start_frame, end_frame=end_frame)
    
    def get_sampling_frequency(self):
        return self._sorting.get_sampling_frequency()
    
    def set_sampling_frequency(self, freq):
        self._sorting.set_sampling_frequency(freq)
    
    @staticmethod
    def write_sorting(sorting, save_path):
        MdaSortingExtractor.write_sorting(sorting=sorting, save_path=save_path)

        # unit_ids = sorting.get_unit_ids()
        # times_list = []
        # labels_list = []
        # primary_channels_list = []
        # for unit_id in unit_ids:
        #     times = sorting.get_unit_spike_train(unit_id=unit_id)
        #     times_list.append(times)
        #     labels_list.append(np.ones(times.shape) * unit_id)
        #     if write_primary_channels:
        #         if 'max_channel' in sorting.get_unit_property_names(unit_id):
        #             primary_channels_list.append([sorting.get_unit_property(unit_id, 'max_channel')]*times.shape[0])
        #         else:
        #             raise ValueError(
        #                 "Unable to write primary channels because 'max_channel' spike feature not set in unit " + str(
        #                     unit_id))
        #     else:
        #         primary_channels_list.append(np.zeros(times.shape))
        # all_times = _concatenate(times_list)
        # all_labels = _concatenate(labels_list)
        # all_primary_channels = _concatenate(primary_channels_list)
        # sort_inds = np.argsort(all_times)
        # all_times = all_times[sort_inds]
        # all_labels = all_labels[sort_inds]
        # all_primary_channels = all_primary_channels[sort_inds]
        # L = len(all_times)
        # firings = np.zeros((3, L))
        # firings[0, :] = all_primary_channels
        # firings[1, :] = all_times
        # firings[2, :] = all_labels
        #
        # firings_path = ka.store_npy(array=firings, basename='firings.npy')
        # sorting_obj = _json_serialize(dict(
        #     firings=firings_path,
        #     samplerate=sorting.get_sampling_frequency(),
        #     unit_ids=unit_ids,
        # ))
        # if save_path is not None:
        #     with open(save_path, 'w') as f:
        #         json.dump(sorting_obj, f, indent=4)
        # return sorting_obj

# class NwbSortingExtractor(se.SortingExtractor):
#     def __init__(self, *, path, nwb_path):
#         import h5py
#         super().__init__()
#         self._path = path
#         with h5py.File(self._path, 'r') as f:
#             X = load_nwb_item(file=f, nwb_path=nwb_path)
#             self._spike_times = X['spike_times'][:] * self.get_sampling_frequency()
#             self._spike_times_index = X['spike_times_index'][:]
#             self._unit_ids = X['id'][:]
#             self._index_by_id = dict()
#             for index, id0 in enumerate(self._unit_ids):
#                 self._index_by_id[id0] = index

#     def get_unit_ids(self):
#         return [int(val) for val in self._unit_ids]

#     def get_unit_spike_train(self, unit_id, start_frame=None, end_frame=None):
#         if start_frame is None:
#             start_frame = 0
#         if end_frame is None:
#             end_frame = np.Inf
#         index = self._index_by_id[unit_id]
#         ii2 = self._spike_times_index[index]
#         if index - 1 >= 0:
#             ii1 = self._spike_times_index[index - 1]
#         else:
#             ii1 = 0
#         return self._spike_times[ii1:ii2]
    
#     def get_sampling_frequency(self):
#         # need to fix this
#         return 30000

# def _concatenate(list):
#     if len(list) == 0:
#         return np.array([])
#     return np.concatenate(list)

# def _json_serialize(x):
#     if isinstance(x, np.ndarray):
#         return _listify_ndarray(x)
#     elif isinstance(x, np.integer):
#         return int(x)
#     elif isinstance(x, np.floating):
#         return float(x)
#     elif type(x) == dict:
#         ret = dict()
#         for key, val in x.items():
#             ret[key] = _json_serialize(val)
#         return ret
#     elif type(x) == list:
#         ret = []
#         for i, val in enumerate(x):
#             ret.append(_json_serialize(val))
#         return ret
#     else:
#         return x

# def _listify_ndarray(x):
#     if x.ndim == 1:
#         if np.issubdtype(x.dtype, np.integer):
#             return [int(val) for val in x]
#         else:
#             return [float(val) for val in x]
#     elif x.ndim == 2:
#         ret = []
#         for j in range(x.shape[1]):
#             ret.append(_listify_ndarray(x[:, j]))
#         return ret
#     elif x.ndim == 3:
#         ret = []
#         for j in range(x.shape[2]):
#             ret.append(_listify_ndarray(x[:, :, j]))
#         return ret
#     elif x.ndim == 4:
#         ret = []
#         for j in range(x.shape[3]):
#             ret.append(_listify_ndarray(x[:, :, :, j]))
#         return ret
#     else:
#         raise Exception('Cannot listify ndarray with {} dims.'.format(x.ndim))

# def _resolve_paths_in_item(x):
#     if isinstance(x, hi.File):
#         return x.path
#     elif type(x) == list:
#         return [_resolve_paths_in_item[v] for v in x]
#     elif type(x) == tuple:
#         return tuple([_resolve_paths_in_item[v] for v in x])
#     elif type(x) == dict:
#         ret = dict()
#         for k, v in x.items():
#             ret[k] = _resolve_paths_in_item(v)
#     else:
#         return x

# def _samplehash(sorting):
#     from mountaintools import client as mt
#     obj = {
#         'unit_ids': sorting.get_unit_ids(),
#         'sampling_frequency': sorting.get_sampling_frequency(),
#         'data': _samplehash_helper(sorting)
#     }
#     return mt.sha1OfObject(obj)


# def _samplehash_helper(sorting):
#     h = 0
#     for id in sorting.get_unit_ids():
#         st = sorting.get_unit_spike_train(unit_id=id)
#         h = hash((hash(bytes(st)), hash(h)))
#     return h