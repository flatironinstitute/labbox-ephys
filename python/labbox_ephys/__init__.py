__version__ = "0.4.10"

import os
import sys

from .api._workersession import WorkerSession
from .extensions import *
from .extractors import (LabboxEphysRecordingExtractor,
                         LabboxEphysSortingExtractor, MdaRecordingExtractor,
                         MdaSortingExtractor, writemda32)
from .helpers.find_unit_neighborhoods import find_unit_neighborhoods
from .helpers.find_unit_peak_channels import find_unit_peak_channels
from .helpers.get_unit_waveforms import get_unit_waveforms
from .helpers.prepare_snippets_h5 import (prepare_snippets_h5,
                                          prepare_snippets_h5_from_extractors)
from .helpers.SubsampledSortingExtractor import SubsampledSortingExtractor
from .misc import get_recording_info, get_recording_object, get_sorting_info
from .register_views import (recording_views, register_recording_view,
                             register_sorting_view, sorting_views)
from .sorters import sorters

# this is how the python functions in the extensions get registered
thisdir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, f'{thisdir}/../../src')
import extensions

extensions # just keep the linter happy - we only need to import extensions to register the hither functions
# remove the prepended path so we don't have side-effects
sys.path.remove(f'{thisdir}/../../src')

dummy = 0
