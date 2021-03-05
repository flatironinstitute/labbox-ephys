// This file was automatically generated. Do not edit directly. See devel/templates.

import { LabboxExtensionContext } from './python/labbox_ephys/extensions/pluginInterface'

////////////////////////////////////////////////////////////////////////////////////
// The list of extensions is configured in devel/code_generation.yaml
import { activate as activate_mainwindow } from './python/labbox_ephys/extensions/mainwindow/mainwindow'
import { activate as activate_workspaceview } from './python/labbox_ephys/extensions/workspaceview/workspaceview'
import { activate as activate_mountainview } from './python/labbox_ephys/extensions/mountainview/mountainview'
import { activate as activate_averagewaveforms } from './python/labbox_ephys/extensions/averagewaveforms/averagewaveforms'
import { activate as activate_clusters } from './python/labbox_ephys/extensions/clusters/clusters'
import { activate as activate_correlograms } from './python/labbox_ephys/extensions/correlograms/correlograms'
import { activate as activate_electrodegeometry } from './python/labbox_ephys/extensions/electrodegeometry/electrodegeometry'
import { activate as activate_firetrack } from './python/labbox_ephys/extensions/firetrack/firetrack'
import { activate as activate_pythonsnippets } from './python/labbox_ephys/extensions/pythonsnippets/pythonsnippets'
import { activate as activate_snippets } from './python/labbox_ephys/extensions/snippets/snippets'
import { activate as activate_spikeamplitudes } from './python/labbox_ephys/extensions/spikeamplitudes/spikeamplitudes'
import { activate as activate_timeseries } from './python/labbox_ephys/extensions/timeseries/timeseries'
import { activate as activate_unitstable } from './python/labbox_ephys/extensions/unitstable/unitstable'
////////////////////////////////////////////////////////////////////////////////////

const registerExtensions = (context: LabboxExtensionContext) => {
    ////////////////////////////////////////////////////////////////////////////////
    // The list of extensions is configured in devel/code_generation.yaml
    activate_mainwindow(context)
    activate_workspaceview(context)
    activate_mountainview(context)
    activate_averagewaveforms(context)
    activate_clusters(context)
    activate_correlograms(context)
    activate_electrodegeometry(context)
    activate_firetrack(context)
    activate_pythonsnippets(context)
    activate_snippets(context)
    activate_spikeamplitudes(context)
    activate_timeseries(context)
    activate_unitstable(context)
    ////////////////////////////////////////////////////////////////////////////////
}

export default registerExtensions
