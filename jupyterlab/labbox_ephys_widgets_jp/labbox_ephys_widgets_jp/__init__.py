#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jeremy Magland.
# Distributed under the terms of the Modified BSD License.

from ._version import __version__, version_info
from .create_recording_view import create_recording_view
from .create_sorting_view import create_sorting_view

from .request_handlers import load_jupyter_server_extension

# this is how the python functions in the extensions get registered
import os
import sys
thisdir = os.path.dirname(os.path.realpath(__file__))
os.environ['LABBOX_EPHYS_PYTHON_MODULE_DIR'] = f'{thisdir}/../../../labbox_ephys'
sys.path.insert(0, f'{thisdir}/../src')
import extensions

extensions # just keep the linter happy - we only need to import extensions to register the hither functions
# remove the prepended path so we don't have side-effects
sys.path.remove(f'{thisdir}/../src')