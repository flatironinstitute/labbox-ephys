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
    X = RecordingView()
    return X
