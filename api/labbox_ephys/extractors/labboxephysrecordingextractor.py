import kachery as ka
from .bandpass_filter import bandpass_filter
import spikeextractors as se
import numpy as np
import hither as hi
from .mdaextractors import MdaRecordingExtractor

def _path(x):
    if type(x) is str:
        return x
    elif isinstance(x, hi.File):
        return x.path
    else:
        raise Exception('Cannot get path from:', x)

class LabboxEphysRecordingExtractor(se.RecordingExtractor):
    def __init__(self, arg, download=False):
        super().__init__()
        self.arg = arg

        if (type(arg) == dict) and ('path' in arg):
            arg = arg['path']

        if isinstance(arg, LabboxEphysRecordingExtractor):
            self._recording = arg
            self.arg = arg.arg
        else:
            if type(arg) == str or isinstance(arg, hi.File):
                path = _path(arg)
                if path.endswith('.json'):
                    arg = ka.load_object(path)
                    if arg is None:
                        raise Exception(f'Unable to load object: {path}')
            
            if type(arg) == str or isinstance(arg, hi.File):
                path = _path(arg)
                if path.startswith('sha1dir') or path.startswith('/'):
                    if can_load_mda(path):
                        self._recording = MdaRecordingExtractor(recording_directory=path, download=download)
                    elif can_load_nrs(path):
                        self._recording = NrsRecordingExtractor(path)
                    else:
                        raise Exception('Invalid arg for LabboxEphysRecordingExtractor', arg)    
                else:
                    raise Exception('Invalid arg for LabboxEphysRecordingExtractor', arg)
            elif type(arg) == dict:
                if ('recording' in arg) and ('filters' in arg):
                    recording1 = LabboxEphysRecordingExtractor(arg['recording'], download=download)
                    self._recording = self._apply_filters(recording1, arg['filters'])
                if ('recording' in arg) and ('group' in arg):
                    R = LabboxEphysRecordingExtractor(arg['recording'], download=download)
                    channel_ids = np.array(R.get_channel_ids())
                    groups = R.get_channel_groups(channel_ids=R.get_channel_ids())
                    group = int(arg['group'])
                    inds = np.where(np.array(groups) == group)[0]
                    channel_ids = channel_ids[inds]
                    self._recording = se.SubRecordingExtractor(
                        parent_recording=R,
                        channel_ids=np.array(channel_ids)
                    )
                    self.arg = dict(group=group, recording=R.object())
                elif ('recording' in arg) and ('channel_ids' in arg):
                    R = LabboxEphysRecordingExtractor(arg['recording'], download=download)
                    channel_ids = arg['channel_ids']
                    self._recording = se.SubRecordingExtractor(
                        parent_recording=R,
                        channel_ids=np.array(channel_ids)
                    )
                    self.arg = dict(channel_ids=channel_ids, recording=R.object())
                elif ('raw' in arg) and ('params' in arg) and ('geom' in arg):
                    self._recording = MdaRecordingExtractor(timeseries_path=_path(arg['raw']), samplerate=arg['params']['samplerate'], geom=np.array(arg['geom']), download=download)
                else:
                    raise Exception('Invalid arg for LabboxEphysRecordingExtractor', arg)
            else:
                raise Exception('Invalid arg for LabboxEphysRecordingExtractor', arg)    

        self.copy_channel_properties(recording=self._recording)
    
    def object(self):
        return _resolve_paths_in_item(self.arg)

    def _apply_filters(self, recording, filters):
        ret = recording
        for filter0 in filters:
            ret = self._apply_filter(ret, filter0)
        return ret
    
    def _apply_filter(self, recording, filter0):
        if filter0['type'] == 'bandpass_filter':
            args = dict()
            if 'freq_min' in filter0:
                args['freq_min'] = filter0['freq_min']
            if 'freq_max' in filter0:
                args['freq_max'] = filter0['freq_max']
            if 'freq_wid' in filter0:
                args['freq_wid'] = filter0['freq_wid']
            return bandpass_filter(recording, **args)
        return None
    
    def hash(self):
        return ka.get_object_hash(self.arg)

    def get_channel_ids(self):
        return self._recording.get_channel_ids()

    def get_num_frames(self):
        return self._recording.get_num_frames()

    def get_sampling_frequency(self):
        return self._recording.get_sampling_frequency()

    def get_traces(self, channel_ids=None, start_frame=None, end_frame=None):
        return self._recording.get_traces(channel_ids=channel_ids, start_frame=start_frame, end_frame=end_frame)

    @staticmethod
    def can_load_dir(path):
        if can_load_mda(path):
            return True
        if can_load_nrs(path):
            return True
        return False
    
    @staticmethod
    def get_recording_object(recording):
        with hi.TemporaryDirectory() as tmpdir:
            MdaRecordingExtractor.write_recording(recording=recording, save_path=tmpdir)
            raw = ka.store_file(tmpdir + '/raw.mda')
            params = ka.load_object(tmpdir + '/params.json')
            geom = np.genfromtxt(tmpdir + '/geom.csv', delimiter=',').tolist()
            return dict(
                raw=raw,
                params=params,
                geom=geom
            )

def _resolve_paths_in_item(x):
    if isinstance(x, hi.File):
        return x.path
    elif type(x) == list:
        return [_resolve_paths_in_item(v) for v in x]
    elif type(x) == tuple:
        return tuple([_resolve_paths_in_item(v) for v in x])
    elif type(x) == dict:
        ret = dict()
        for k, v in x.items():
            ret[k] = _resolve_paths_in_item(v)
        return ret
    else:
        return x

def can_load_mda(path):
    dd = ka.read_dir(path)
    if 'raw.mda' in dd['files'] and 'params.json' in dd['files'] and 'geom.csv' in dd['files']:
        return True
    return False

def check_load_nrs(recording_path):
    dd = ka.read_dir(recording_path)
    probe_file = None
    xml_file = None
    nrs_file = None
    dat_file = None
    for f in dd['files'].keys():
        if f.endswith('.json'):
            obj = ka.load_object(recording_path + '/' + f)
            if obj.get('format_version', None) in ['flatiron-probe-0.1', 'flatiron-probe-0.2']:
                probe_file = recording_path + '/' + f
        elif f.endswith('.xml'):
            xml_file = recording_path + '/' + f
        elif f.endswith('.nrs'):
            nrs_file = recording_path + '/' + f
        elif f.endswith('.dat'):
            dat_file = recording_path + '/' + f
    if probe_file is not None and xml_file is not None and nrs_file is not None and dat_file is not None:
        info = dict(
            probe_file=probe_file,
            xml_file=xml_file,
            nrs_file=nrs_file,
            dat_file=dat_file
        )
        return info
    return None

def can_load_nrs(recording_path):
    info = check_load_nrs(recording_path)
    return (info is not None)

class NrsRecordingExtractor(se.RecordingExtractor):
    extractor_name = 'NrsRecordingExtractor'
    is_writable = False
    def __init__(self, dirpath):
        se.RecordingExtractor.__init__(self)
        info = check_load_nrs(dirpath)
        assert info is not None
        probe_obj = ka.load_object(info['probe_file'])
        xml_file = ka.load_file(info['xml_file'])
        # nrs_file = ka.load_file(info['nrs_file'])
        dat_file = ka.load_file(info['dat_file'])

        from xml.etree import ElementTree as ET
        xml = ET.parse(xml_file)
        root_element = xml.getroot()
        try:
            self._samplerate = float(root_element.find('acquisitionSystem/samplingRate').text)
        except:
            raise Exception('Unable to load acquisitionSystem/samplingRate')
        try:
            self._nChannels = int(root_element.find('acquisitionSystem/nChannels').text)
        except:
            raise Exception('Unable to load acquisitionSystem/nChannels')
        try:
            self._nBits = int(root_element.find('acquisitionSystem/nBits').text)
        except:
            raise Exception('Unable to load acquisitionSystem/nBits')

        if self._nBits == 16:
            dtype = np.int16
        elif self._nBits == 32:
            dtype = np.int32
        else:
            raise Exception(f'Unexpected nBits: {self._nBits}')

        self._rec = se.BinDatRecordingExtractor(dat_file, sampling_frequency=self._samplerate, numchan=self._nChannels, dtype=dtype)

        self._channel_ids = probe_obj['channel']
        for ii in range(len(probe_obj['channel'])):
            channel = probe_obj['channel'][ii]
            x = probe_obj['x'][ii]
            y = probe_obj['y'][ii]
            z = probe_obj['z'][ii]
            group = probe_obj.get('group', probe_obj.get('shank'))[ii]
            self.set_channel_property(channel, 'location', [x, y, z])
            self.set_channel_property(channel, 'group', group)

    def get_channel_ids(self):
        return self._channel_ids

    def get_num_frames(self):
        return self._rec.get_num_frames()

    def get_sampling_frequency(self):
        return self._rec.get_sampling_frequency()

    def get_traces(self, channel_ids=None, start_frame=None, end_frame=None):
        if channel_ids is None:
            channel_ids = self._channel_ids
        return self._rec.get_traces(channel_ids=channel_ids, start_frame=start_frame, end_frame=end_frame)
