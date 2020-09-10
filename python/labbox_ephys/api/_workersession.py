import os
import kachery_p2p as kp
import hither as hi
import time

job_cache_path = os.environ['KACHERY_STORAGE_DIR'] + '/job-cache'
if not os.path.exists(job_cache_path):
    os.mkdir(job_cache_path)
job_cache=hi.JobCache(path=job_cache_path)

class LabboxContext:
    def __init__(self, worker_session):
        self._worker_session = worker_session
    def get_default_job_cache(self):
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
        self._document_id = None
        self._readonly = None
        self._jobs_by_id = {}
        self._remote_job_handlers = {}
        self._on_message_callbacks = []
        self._queued_document_action_messages = []

    def initialize(self):
        node_id = kp.get_node_id()

        server_info = {
            'nodeId': node_id,
            'defaultFeedId': self._default_feed_id
        }
        msg = {
            'type': 'reportServerInfo',
            'serverInfo': server_info,
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
            self._document_id = msg['clientInfo']['documentId']
            self._readonly = msg['clientInfo']['readOnly']
            if not self._feed_uri:
                self._feed_uri = 'feed://' + self._default_feed_id
                # self._feed_uri = kp.create_feed(feed_name='labbox-ephys-default').get_uri()
            # assert self._feed_uri.startswith('sha1://'), 'For now, feedUri must start with sha1://'
            self._feed = kp.load_feed(self._feed_uri)
            for key in ['recordings', 'sortings']:
                self._subfeed_positions[key] = 0
                subfeed_name = dict(key=key, documentId=self._document_id)
                subfeed = self._feed.get_subfeed(subfeed_name)
                for m in subfeed.get_next_messages(wait_msec=10):
                    self._send_message({'type': 'action', 'action': m['action']})
                    self._subfeed_positions[key] = self._subfeed_positions[key] + 1
            self._send_message({
                'type': 'reportInitialLoadComplete'
            })
            if self._feed:
                qm = self._queued_document_action_messages
                self._queued_document_action_messages = []
                for m in qm:
                    self.handle_message(m)
        elif type0 == 'appendDocumentAction':
            if self._readonly:
                print('Cannot append document action. This is a readonly feed.')
                return
            if self._feed is None:
                self._queued_document_action_messages.append(msg)
            else:
                subfeed_name = dict(key=msg['key'], documentId=self._document_id)
                subfeed = self._feed.get_subfeed(subfeed_name)
                subfeed.append_message({
                    'action': msg['action']
                })
        elif type0 == 'hitherCreateJob':
            functionName = msg['functionName']
            kwargs = msg['kwargs']
            opts = msg['opts']
            client_job_id = msg['clientJobId']
            if opts.get('newHitherJobMethod', False):
                try:
                    job = hi.run(functionName, **kwargs, labbox=self._labbox_context).wait()
                except Exception as err:
                    self._send_message({
                        'type': 'hitherJobCreationError',
                        'client_job_id': client_job_id,
                        'error': str(err)
                    })
                    return
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
                hither_config = opts.get('hither_config', {})
                job_handler_name = opts.get('job_handler_name', 'default')
                required_files = opts.get('required_files', {})
                jh = self._get_job_handler_from_name(job_handler_name)
                hither_config['job_handler'] = jh
                hither_config['required_files'] = required_files
                if hither_config['job_handler'].is_remote:
                    hither_config['container'] = True
                if 'use_job_cache' in hither_config:
                    if hither_config['use_job_cache']:
                        hither_config['job_cache'] = self._default_job_cache
                    del hither_config['use_job_cache']
                with hi.Config(**hither_config):
                    try:
                        job = hi.run(functionName, **kwargs)
                    except Exception as err:
                        self._send_message({
                            'type': 'hitherJobCreationError',
                            'client_job_id': client_job_id,
                            'error': str(err)
                        })
                        return
                    setattr(job, '_client_job_id', client_job_id)
                    job_id = job._job_id
                    self._jobs_by_id[job_id] = job
                    print(f'======== Created hither job: {job_id} {functionName} ({job_handler_name})')
                self._send_message({
                    'type': 'hitherJobCreated',
                    'job_id': job_id,
                    'client_job_id': client_job_id
                })
        elif type0 == 'hitherCancelJob':
            job_id = msg['job_id']
            assert job_id, 'Missing job_id'
            assert job_id in self._jobs_by_id, f'No job with id: {job_id}'
            job = self._jobs_by_id[job_id]
            job.cancel()
    def iterate(self):
        if (self._feed_uri is not None) and (self._feed_uri.startswith('feed://')):
            subfeed_watches = {}
            for key in ['recordings', 'sortings']:
                subfeed_name = dict(key=key, documentId=self._document_id)
                subfeed_watches[key] = dict(
                    feedId=self._feed._feed_id, # fix this
                    subfeedName=subfeed_name,
                    position=self._subfeed_positions[key]
                )
            messages = kp.watch_for_new_messages(subfeed_watches=subfeed_watches, wait_msec=100)
            for key in messages.keys():
                for m in messages[key]:
                    self._send_message({'type': 'action', 'action': m['action']})
                    self._subfeed_positions[key] = self._subfeed_positions[key] + 1
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
                    'result': result,
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
    def on_message(self, callback):
        self._on_message_callbacks.append(callback)
    def _send_message(self, msg):
        for cb in self._on_message_callbacks:
            cb(msg)
    def _get_job_handler_from_name(self, job_handler_name):
        assert job_handler_name in self._labbox_config['job_handlers'], f'Job handler not found in config: {job_handler_name}'
        a = self._labbox_config['job_handlers'][job_handler_name]
        if a['type'] == 'local':
            jh = self._local_job_handlers[job_handler_name]
        elif a['type'] == 'remote':
            jh = self._get_remote_job_handler(job_handler_name=job_handler_name, uri=a['uri'])
        else:
            raise Exception(f'Unexpected job handler type: {a["type"]}')
        return jh
    def _get_remote_job_handler(self, job_handler_name, uri):
        if job_handler_name not in self._remote_job_handlers:
            self._remote_job_handlers[job_handler_name] = hi.RemoteJobHandler(compute_resource_uri=uri)
        return self._remote_job_handlers[job_handler_name]
    