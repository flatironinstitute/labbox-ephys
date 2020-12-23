import os
import sys
from typing import Dict

import hither as hi
# this is how the hither functions get registered
import labbox_ephys as le
import numpy as np
from hither.job import Job as HitherJob
from ipywidgets import DOMWidget
from traitlets import Dict as DictTrait
from traitlets import List as ListTrait
from traitlets import Unicode

from ._frontend import module_name, module_version

labbox_config = {
        'job_handlers': {
            'default': {
                'type': 'local'
            },
            'partition1': {
                'type': 'local'
            },
            'partition2': {
                'type': 'local'
            },
            'partition3': {
                'type': 'local'
            },
            'timeseries': {
                'type': 'local'
            }
        }
    }

# class LabboxContext:
#     def __init__(self):
#         self._job_cache = hi.JobCache(use_tempdir=True)
#         self._job_handler = hi.ParallelJobHandler(4)
#     def get_default_job_cache(self):
#         return self._job_cache
#     def get_job_handler(self, job_handler_name):
#         return self._job_handler
# labbox_context = LabboxContext()

def create_sorting_view(plugin_name: str, *, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor):
    class SortingView(DOMWidget):
        _model_name = Unicode('SortingViewModel').tag(sync=True)
        _model_module = Unicode(module_name).tag(sync=True)
        _model_module_version = Unicode(module_version).tag(sync=True)
        _view_name = Unicode('SortingView').tag(sync=True)
        _view_module = Unicode(module_name).tag(sync=True)
        _view_module_version = Unicode(module_version).tag(sync=True)
        pluginName = Unicode(plugin_name).tag(sync=True)
        sortingObject = DictTrait(sorting.object()).tag(sync=True)
        recordingObject = DictTrait(recording.object()).tag(sync=True)
        recordingInfo = DictTrait(le.get_recording_info(recording_object=recording.object())).tag(sync=True)
        sortingInfo = DictTrait(le.get_sorting_info(sorting_object=sorting.object(), recording_object=recording.object())).tag(sync=True)
        selection = DictTrait({}).tag(sync=True)
        curation = DictTrait({}).tag(sync=True)
        externalUnitMetrics = ListTrait([]).tag(sync=True)
        def __init__(self) -> None:
            super().__init__()
            self.on_msg(self._handle_message)
            self._worker_session = le.WorkerSession(labbox_config=labbox_config)
            def on_msg(msg):
                self.send(msg)
            self._worker_session.on_message(on_msg)
        def _handle_message(self, widget, msg, buffers):
            if msg['type'] == 'iterate':
                self._worker_session.iterate()
            else:
                self._worker_session.handle_message(msg)
    X = SortingView()
    return X

def _make_json_safe(x):
    if isinstance(x, np.integer):
        return int(x)
    elif isinstance(x, np.floating):
        return float(x)
    elif type(x) == dict:
        ret = dict()
        for key, val in x.items():
            ret[key] = _make_json_safe(val)
        return ret
    elif (type(x) == list) or (type(x) == tuple):
        return [_make_json_safe(val) for val in x]
    elif isinstance(x, np.ndarray):
        raise Exception('Cannot make ndarray json safe')
    else:
        if _is_jsonable(x):
            # this will capture int, float, str, bool
            return x
    raise Exception(f'Item is not json safe: {type(x)}')

def _is_jsonable(x) -> bool:
    import json
    try:
        json.dumps(x)
        return True
    except:
        return False
