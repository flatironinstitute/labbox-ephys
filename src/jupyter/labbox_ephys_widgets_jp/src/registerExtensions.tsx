// This file was automatically generated. Do not edit directly.


// !begin-code-generation!
import { LabboxExtensionContext } from './extensions/pluginInterface';

import { activate as activate_mainwindow } from './extensions/mainwindow/mainwindow'
import { activate as activate_workspaceview } from './extensions/workspaceview/workspaceview'
import { activate as activate_mountainview } from './extensions/mountainview/mountainview'
import { activate as activate_averagewaveforms } from './extensions/averagewaveforms/averagewaveforms'
import { activate as activate_clusters } from './extensions/clusters/clusters'
import { activate as activate_correlograms } from './extensions/correlograms/correlograms'
import { activate as activate_electrodegeometry } from './extensions/electrodegeometry/electrodegeometry'
import { activate as activate_firetrack } from './extensions/firetrack/firetrack'
import { activate as activate_pythonsnippets } from './extensions/pythonsnippets/pythonsnippets'
import { activate as activate_snippets } from './extensions/snippets/snippets'
import { activate as activate_spikeamplitudes } from './extensions/spikeamplitudes/spikeamplitudes'
import { activate as activate_timeseries } from './extensions/timeseries/timeseries'
import { activate as activate_unitstable } from './extensions/unitstable/unitstable'
// !end-code-generation!

const registerExtensions = (context: LabboxExtensionContext) => {
    // !begin-code-generation!
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
    // !end-code-generation!
}

export default registerExtensions