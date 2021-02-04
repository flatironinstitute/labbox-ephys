import os
import sys
import json
from copy import deepcopy
from typing import Dict, Union

import hither as hi
import kachery_p2p as kp
# this is how the hither functions get registered
import labbox_ephys as le
import numpy as np
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

def create_sorting_view(
    plugin_name: str, *,
    sorting: le.LabboxEphysSortingExtractor,
    recording: le.LabboxEphysRecordingExtractor,
    curation_subfeed: Union[kp.Subfeed, None]=None,
    height: float=0
):
    class SortingViewJp(DOMWidget):
        _model_name = Unicode('SortingViewJpModel').tag(sync=True)
        _model_module = Unicode(module_name).tag(sync=True)
        _model_module_version = Unicode(module_version).tag(sync=True)
        _view_name = Unicode('SortingViewJp').tag(sync=True)
        _view_module = Unicode(module_name).tag(sync=True)
        _view_module_version = Unicode(module_version).tag(sync=True)
        pluginName = Unicode(plugin_name).tag(sync=True)
        sortingObject = DictTrait(sorting.object()).tag(sync=True)
        recordingObject = DictTrait(recording.object()).tag(sync=True)
        recordingInfo = DictTrait(le.get_recording_info(recording_object=recording.object())).tag(sync=True)
        sortingInfo = DictTrait(le.get_sorting_info(sorting_object=sorting.object(), recording_object=recording.object())).tag(sync=True)
        curationUri = Unicode(curation_subfeed.get_uri() if curation_subfeed is not None else '').tag(sync=True)
        selection = DictTrait({}).tag(sync=True)
        curation = DictTrait({}).tag(sync=True)
        externalUnitMetrics = ListTrait([]).tag(sync=True)
        widgetHeight = FloatTrait(height).tag(sync=True)
        def __init__(self) -> None:
            super().__init__()
            self.on_msg(self._handle_message)
            self._worker_session = le.WorkerSession(labbox_config=labbox_config)
            def on_msg(msg):
                self.send(msg)
            self._worker_session.on_message(on_msg)
        def get_selection(self):
            return deepcopy(self.selection)
        def set_selection(self, selection):
            self.selection = deepcopy(selection)
        def get_curation(self):
            return deepcopy(self.curation)
        def set_curation(self, curation):
            self.curation = deepcopy(curation)
        def get_external_unit_metrics(self):
            return deepcopy(self.externalUnitMetrics)
        def set_external_unit_metrics(self, external_unit_metrics):
            self.externalUnitMetrics = deepcopy(external_unit_metrics)
        def _handle_message(self, widget, msg, buffers):
            if msg['type'] == 'iterate':
                self._worker_session.iterate()
            elif msg['type'] == 'appendSubfeedMessage':
                feed_id = msg['feedId']
                subfeed_hash = msg['subfeedHash']
                sf = kp.load_subfeed(f'feed://{feed_id}/~{subfeed_hash}')
                sf.append_message(msg['message'])
                self._worker_session.iterate()
            elif msg['type'] == 'addSubfeedWatch':
                self._worker_session.add_subfeed_watch(
                    watch_name=msg['watchName'],
                    feed_id=msg['feedId'],
                    subfeed_hash=msg['subfeedHash']
                )
            else:
                self._worker_session.handle_message(msg)
    X = SortingViewJp()
    return X
