#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jeremy Magland.
# Distributed under the terms of the Modified BSD License.

from ._version import __version__, version_info
from .create_recording_view import create_recording_view
from .create_sorting_view import create_sorting_view
from .create_workspace_view import create_workspace_view, WorkspaceView

from .request_handlers import load_jupyter_server_extension

import os
import sys
thisdir = os.path.dirname(os.path.realpath(__file__))
os.environ['LABBOX_EPHYS_PYTHON_MODULE_DIR'] = f'{thisdir}/../../../labbox_ephys'

from labbox_ephys import _sorting_views as sorting_views, _recording_views as recording_views
