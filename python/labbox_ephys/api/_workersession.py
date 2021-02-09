import os
import json
import hashlib
from typing import Union

import hither as hi
import kachery as ka
import kachery_p2p as kp
import numpy as np

job_cache_path = os.environ['KACHERY_STORAGE_DIR'] + '/job-cache'
if not os.path.exists(job_cache_path):
    os.mkdir(job_cache_path)
job_cache=hi.JobCache(path=job_cache_path)

class LabboxContext:
    def __init__(self, worker_session):
        self._worker_session = worker_session
    def get_job_cache(self):
        return job_cache
    def get_job_handler(self, job_handler_name):
        return self._worker_session._get_job_handler_from_name(job_handler_name)

class WorkerSession:
    def __init__(self, *, labbox_config):
        self._labbox_config = labbox_config
        self._local_job_handlers = dict(
            default=hi.ParallelJobHandler(4),
            partition1=hi.ParallelJobHandler(4),
            partition2=hi.ParallelJobHandler(4),
            partition3=hi.ParallelJobHandler(4),
            timeseries=hi.ParallelJobHandler(4)
        )
        self._default_job_cache = job_cache
        self._labbox_context = LabboxContext(worker_session=self)

        self._default_feed_id = kp.get_feed_id('labbox-ephys-default', create=True)
        self._feed = None
        self._subfeed_positions = {}
        self._feed_uri = None
        self._workspace_name = None
        self._readonly = None
        self._jobs_by_id = {}
        self._remote_job_handlers = {}
        self._on_messages_callbacks = []
        self._queued_document_action_messages = []
        self._additional_subfeed_watches = []
        self._workspace_subfeed_watches = []

        self._initial_subfeed_load_complete = False

    def initialize(self):
        node_id = kp.get_node_id()

        server_info = {
            'nodeId': node_id,
            'defaultFeedId': self._default_feed_id,
            'labboxConfig': self._labbox_config
        }
        msg = {
            'type': 'reportServerInfo',
            'serverInfo': server_info
        }
        self._send_message(msg)
    def cleanup(self):
        # todo
        pass
    def handle_message(self, msg):
        type0 = msg.get('type')
        if type0 == 'reportClientInfo':
            print('reported client info:', msg)
            self._feed_uri = msg['clientInfo']['feedUri']
            self._workspace_name = msg['clientInfo']['workspaceName']
            self._readonly = msg['clientInfo']['readOnly']
            if not self._feed_uri:
                self._feed_uri = 'feed://' + self._default_feed_id
            self._feed = kp.load_feed(self._feed_uri)
            if self._feed:
                qm = self._queued_document_action_messages
                self._queued_document_action_messages = []
                for m in qm:
                    self.handle_message(m)
        elif type0 == 'addSubfeedWatch':
            feed_uri = msg['feedUri']
            if not feed_uri:
                feed_uri = 'feed://' + self._default_feed_id
            self.add_subfeed_watch(
                watch_name=msg['watchName'],
                feed_uri=feed_uri,
                subfeed_name=msg['subfeedName'],
                position=msg.get('position', 0)
            )
        elif type0 == 'addWorkspaceSubfeedWatch':
            self.add_workspace_subfeed_watch(
                watch_name=msg['watchName'],
                position=msg.get('position', 0)
            )
        elif type0 == 'appendWorkspaceSubfeedMessage':
            message = msg['message']
            subfeed_name = {'workspaceName': self._workspace_name}
            subfeed = self._feed.get_subfeed(subfeed_name)
            subfeed.append_message(message)
        elif type0 == 'hitherCreateJob':
            functionName = msg['functionName']
            kwargs = msg['kwargs']
            client_job_id = msg['clientJobId']
            try:
                outer_job = hi.run(functionName, **kwargs, labbox=self._labbox_context)
            except Exception as err:
                self._send_message({
                    'type': 'hitherJobError',
                    'job_id': client_job_id,
                    'client_job_id': client_job_id,
                    'error_message': f'Error creating outer job: {str(err)}',
                    'runtime_info': None
                })
                return
            try:
                job_or_result = outer_job.wait()
            except Exception as err:
                self._send_message({
                    'type': 'hitherJobError',
                    'job_id': outer_job._job_id,
                    'client_job_id': client_job_id,
                    'error_message': str(err),
                    'runtime_info': outer_job.get_runtime_info()
                })
                return
            if hasattr(job_or_result, '_job_id'):
                job = job_or_result
                setattr(job, '_client_job_id', client_job_id)
                job_id = job._job_id
                self._jobs_by_id[job_id] = job
                print(f'======== Created hither job (2): {job_id} {functionName}')
                self._send_message({
                    'type': 'hitherJobCreated',
                    'job_id': job_id,
                    'client_job_id': client_job_id
                })
            else:
                result = job_or_result
                msg = {
                    'type': 'hitherJobFinished',
                    'client_job_id': client_job_id,
                    'job_id': client_job_id,
                    # 'result': _make_json_safe(result),
                    'result_sha1': ka.get_file_hash(ka.store_object(_make_json_safe(result))),
                    'runtime_info': outer_job.get_runtime_info()
                }
        elif type0 == 'hitherCancelJob':
            job_id = msg['job_id']
            assert job_id, 'Missing job_id'
            assert job_id in self._jobs_by_id, f'No job with id: {job_id}'
            job = self._jobs_by_id[job_id]
            job.cancel()
    def iterate(self):
        subfeed_msgs = []
        while True:
            found_something = False
            subfeed_watches = {}
            for w in self._additional_subfeed_watches:
                subfeed_watches[w['watch_name']] = {
                    'position': self._subfeed_positions[w['watch_name']],
                    'feedId': _feed_id_from_uri(w['feed_uri']),
                    'subfeedHash': _subfeed_hash_from_name(w['subfeed_name'])
                }
            for w in self._workspace_subfeed_watches:
                if self._feed_uri is not None:
                    subfeed_watches[w['watch_name']] = {
                        'position': self._subfeed_positions[w['watch_name']],
                        'feedId': _feed_id_from_uri(self._feed_uri),
                        'subfeedHash': _subfeed_hash_from_name({'workspaceName': self._workspace_name})
                    }
            if len(subfeed_watches.keys()) > 0:
                messages = kp.watch_for_new_messages(subfeed_watches=subfeed_watches, wait_msec=100)
                for key in messages.keys():
                    if len(messages[key]) > 0:
                        found_something = True
                        for m in messages[key]:
                            subfeed_msgs.append({'type': 'subfeedMessage', 'watchName': key, 'message': m})
                    self._subfeed_positions[key] = self._subfeed_positions[key] + len(messages[key])
            if not found_something:
                break
        if len(subfeed_msgs) > 0:
            self._send_messages(subfeed_msgs)
        if not self._initial_subfeed_load_complete and (self._feed_uri is not None):
            self._initial_subfeed_load_complete = True
            self._send_message({
                'type': 'reportInitialLoadComplete'
            })
        
        hi.wait(0)
        job_ids = list(self._jobs_by_id.keys())
        for job_id in job_ids:
            job = self._jobs_by_id[job_id]
            status0 = job.get_status()
            if status0 == hi.JobStatus.FINISHED:
                print(f'======== Finished hither job: {job_id} {job.get_label()}')
                result = job.get_result()
                runtime_info = job.get_runtime_info()
                del self._jobs_by_id[job_id]
                msg = {
                    'type': 'hitherJobFinished',
                    'client_job_id': job._client_job_id,
                    'job_id': job_id,
                    # 'result': _make_json_safe(result),
                    'result_sha1': ka.get_file_hash(ka.store_object(_make_json_safe(result))),
                    'runtime_info': runtime_info
                }
                self._send_message(msg)
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
                self._send_message(msg)
    def on_messages(self, callback):
        self._on_messages_callbacks.append(callback)
    def add_subfeed_watch(self, *, watch_name: str, feed_uri: str, subfeed_name: Union[str, dict], position=0):
        self._additional_subfeed_watches.append(dict(
            watch_name=watch_name,
            feed_uri=feed_uri,
            subfeed_name=subfeed_name
        ))
        self._subfeed_positions[watch_name] = position
    def add_workspace_subfeed_watch(self, *, watch_name: str, position=0):
        self._workspace_subfeed_watches.append(dict(
            watch_name=watch_name
        ))
        self._subfeed_positions[watch_name] = position
    def _send_message(self, msg):
        for cb in self._on_messages_callbacks:
            cb([msg])
    def _send_messages(self, msgs):
        for cb in self._on_messages_callbacks:
            cb(msgs)
    def _get_job_handler_from_name(self, job_handler_name):
        assert job_handler_name in self._labbox_config['job_handlers'], f'Job handler not found in config: {job_handler_name}'
        a = self._labbox_config['job_handlers'][job_handler_name]
        compute_resource_uri = self._labbox_config.get('compute_resource_uri', '')
        if a['type'] == 'local':
            jh = self._local_job_handlers[job_handler_name]
        elif a['type'] == 'remote':
            jh = self._get_remote_job_handler(job_handler_name=job_handler_name, uri=compute_resource_uri)
        else:
            raise Exception(f'Unexpected job handler type: {a["type"]}')
        return jh
    def _get_remote_job_handler(self, job_handler_name, uri):
        if job_handler_name not in self._remote_job_handlers:
            self._remote_job_handlers[job_handler_name] = hi.RemoteJobHandler(compute_resource_uri=uri)
        return self._remote_job_handlers[job_handler_name]

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

def _feed_id_from_uri(uri: str):
    a = uri.split('/')
    return a[2]

def _subfeed_hash_from_name(subfeed_name: Union[str, dict]):
    if isinstance(subfeed_name, str):
        if subfeed_name.startswith('~'):
            return subfeed_name[1:]
        return _sha1_of_string(subfeed_name)
    else:
        return _sha1_of_object(subfeed_name)

def _sha1_of_string(txt: str) -> str:
    hh = hashlib.sha1(txt.encode('utf-8'))
    ret = hh.hexdigest()
    return ret

def _sha1_of_object(obj: object) -> str:
    txt = json.dumps(obj, sort_keys=True, separators=(',', ':'))
    return _sha1_of_string(txt)