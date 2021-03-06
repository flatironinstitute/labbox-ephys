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
    return create_workspace_view(workspace_uri=workspace.get_uri(), height=height)

def create_workspace_view(
    *,
    workspace_uri: str,
    height: float=0
):
    class WorkspaceViewJp(DOMWidget):
        _model_name = Unicode('WorkspaceViewJpModel').tag(sync=True)
        _model_module = Unicode(module_name).tag(sync=True)
        _model_module_version = Unicode(module_version).tag(sync=True)
        _view_name = Unicode('WorkspaceViewJp').tag(sync=True)
        _view_module = Unicode(module_name).tag(sync=True)
        _view_module_version = Unicode(module_version).tag(sync=True)
        workspaceUri = Unicode(workspace_uri).tag(sync=True)
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
            else:
                self._worker_session.handle_message(msg)
                self._worker_session.iterate()
    X = WorkspaceViewJp()
    return X
