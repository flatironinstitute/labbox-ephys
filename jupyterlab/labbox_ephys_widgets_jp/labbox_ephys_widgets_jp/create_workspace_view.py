import os
import sys
import json
from copy import deepcopy
from typing import Dict, Union

import hither as hi
import kachery_p2p as kp
# this is how the hither functions get registered
import labbox_ephys as le
import labbox as lb
from labbox_ephys.workspace.workspace import Workspace
from hither.job import Job as HitherJob
from ipywidgets import DOMWidget
from traitlets import Dict as DictTrait
from traitlets import List as ListTrait
from traitlets import Float as FloatTrait
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

def WorkspaceView(*, workspace: Workspace, height: float=0):
    return create_workspace_view(feed_uri=workspace.get_feed_uri(), workspace_name=workspace.get_workspace_name(), height=height)

def create_workspace_view(
    *,
    feed_uri: str,
    workspace_name: str,
    height: float=0
):
    class WorkspaceViewJp(DOMWidget):
        _model_name = Unicode('WorkspaceViewJpModel').tag(sync=True)
        _model_module = Unicode(module_name).tag(sync=True)
        _model_module_version = Unicode(module_version).tag(sync=True)
        _view_name = Unicode('WorkspaceViewJp').tag(sync=True)
        _view_module = Unicode(module_name).tag(sync=True)
        _view_module_version = Unicode(module_version).tag(sync=True)
        feedUri = Unicode(feed_uri).tag(sync=True)
        workspaceName = Unicode(workspace_name).tag(sync=True)
        widgetHeight = FloatTrait(height).tag(sync=True)
        def __init__(self) -> None:
            super().__init__()
            self.on_msg(self._handle_message)
            self._worker_session = lb.WorkerSession(labbox_config=labbox_config)
            def on_msgs(msgs):
                self.send(msgs)
            self._worker_session.on_messages(on_msgs)
        def _handle_message(self, widget, msg, buffers):
            if msg['type'] == 'iterate':
                self._worker_session.iterate()
            elif msg['type'] == 'appendSubfeedMessage':
                feed_uri = msg['feedUri']
                subfeed_name = msg['subfeedName']
                f = kp.load_feed(feed_uri)
                sf = f.get_subfeed(subfeed_name)
                sf.append_message(msg['message'])
                self._worker_session.iterate()
            elif msg['type'] == 'addSubfeedWatch':
                self._worker_session.add_subfeed_watch(
                    watch_name=msg['watchName'],
                    feed_uri=msg['feedUri'],
                    subfeed_name= msg['subfeedName']
                )
            else:
                self._worker_session.handle_message(msg)
    X = WorkspaceViewJp()
    return X
