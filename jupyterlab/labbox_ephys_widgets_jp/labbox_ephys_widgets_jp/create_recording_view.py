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
from traitlets import Unicode

from ._frontend import module_name, module_version


class LabboxContext:
    def __init__(self):
        self._job_cache = hi.JobCache(use_tempdir=True)
        self._job_handler = hi.ParallelJobHandler(4)
    def get_default_job_cache(self):
        return self._job_cache
    def get_job_handler(self, job_handler_name):
        return self._job_handler
labbox_context = LabboxContext()

def create_recording_view(plugin_name: str, *, recording: le.LabboxEphysRecordingExtractor):
    class RecordingView(DOMWidget):
        _model_name = Unicode('RecordingViewModel').tag(sync=True)
        _model_module = Unicode(module_name).tag(sync=True)
        _model_module_version = Unicode(module_version).tag(sync=True)
        _view_name = Unicode('RecordingView').tag(sync=True)
        _view_module = Unicode(module_name).tag(sync=True)
        _view_module_version = Unicode(module_version).tag(sync=True)
        pluginName = Unicode(plugin_name).tag(sync=True)
        recordingObject = DictTrait(recording.object()).tag(sync=True)
        recordingInfo = DictTrait(le.get_recording_info(recording_object=recording.object())).tag(sync=True)
        def __init__(self) -> None:
            super().__init__()
            self._jobs_by_id: Dict[str, HitherJob] = {}
            self.on_msg(self._handle_message)
        def _handle_message(self, widget, msg, buffers):
            if msg['type'] == 'hitherCreateJob':
                self.send(dict(type='test 1'))
                functionName = msg['functionName']
                kwargs = msg['kwargs']
                opts = msg['opts']
                client_job_id = msg['clientJobId']
                self.send(dict(type='test 2'))
                try:
                    job: HitherJob = hi.run(functionName, **kwargs, labbox=labbox_context).wait()
                except Exception as err:
                    self.send(dict(type='test 3'))
                    self.send({
                        'type': 'hitherJobCreationError',
                        'client_job_id': client_job_id,
                        'error': str(err) + ' (new method)'
                    })
                    return
                self.send(dict(type='test 4'))
                setattr(job, '_client_job_id', client_job_id)
                job_id = job._job_id
                self._jobs_by_id[job_id] = job
                print(f'======== Created hither job (2): {job_id} {functionName}')
                self.send({
                    'type': 'hitherJobCreated',
                    'job_id': job_id,
                    'client_job_id': client_job_id
                })
                self._iterate()
            elif msg['type'] == 'iterate':
                self._iterate()
        def _iterate(self):
            hi.wait(0)
            job_ids = list(self._jobs_by_id.keys())
            self.send(dict(type='iterating', job_ids=job_ids))
            for job_id in job_ids:
                job: HitherJob = self._jobs_by_id[job_id]
                self.send(dict(type='getting status', a=str(job)))
                status0 = job.get_status()
                self.send(dict(type='status', status=status0.value))
                if status0 == hi.JobStatus.FINISHED:
                    print(f'======== Finished hither job: {job_id} {job.get_label()}')
                    result = job.get_result()
                    runtime_info = job.get_runtime_info()
                    del self._jobs_by_id[job_id]
                    msg = {
                        'type': 'hitherJobFinished',
                        'client_job_id': job._client_job_id,
                        'job_id': job_id,
                        'result': _make_json_safe(result),
                        'runtime_info': runtime_info
                    }
                    self.send(msg)
                elif status0 == hi.JobStatus.ERROR:
                    exc = job.get_exception()
                    runtime_info = job.get_runtime_info()
                    del self._jobs_by_id[job_id]
                    msg = {
                        'type': 'hitherJobError',
                        'job_id': job_id,
                        'client_job_id': job._client_job_id,
                        'error_message': str(exc),
                        'runtime_info': runtime_info
                    }
                    self.send(msg)
    X = RecordingView()
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
