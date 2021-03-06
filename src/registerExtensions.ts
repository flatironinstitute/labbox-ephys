// This file was automatically generated. Do not edit directly.


// !begin-code-generation!
import { ExtensionContext } from './extensions/pluginInterface'

import { activate as activatemainwindow } from 'mainwindow/mainwindow'
import { activate as activateworkspaceview } from 'workspaceview/workspaceview'
import { activate as activatemountainview } from 'mountainview/mountainview'
import { activate as activateaveragewaveforms } from 'averagewaveforms/averagewaveforms'
import { activate as activateclusters } from 'clusters/clusters'
import { activate as activatecorrelograms } from 'correlograms/correlograms'
import { activate as activateelectrodegeometry } from 'electrodegeometry/electrodegeometry'
import { activate as activatefiretrack } from 'firetrack/firetrack'
import { activate as activatepythonsnippets } from 'pythonsnippets/pythonsnippets'
import { activate as activatesnippets } from 'snippets/snippets'
import { activate as activatespikeamplitudes } from 'spikeamplitudes/spikeamplitudes'
import { activate as activatetimeseries } from 'timeseries/timeseries'
import { activate as activateunitstable } from 'unitstable/unitstable'
// !end-code-generation!

/*
Extensions are automatically detected and added to this file via code generation (see task configured in vscode)
They must be .tsx files with the following appearing at the top of the file
// LABBOX-EXTENSION: <name>
And they must include an activate() function
Use the following to also include the extension in the jupyterlab extension:
// LABBOX-EXTENSION-TAGS: jupyter
*/


const registerExtensions = (context: LabboxExtensionContext) => {
    // !begin-code-generation!
    activatemainwindow(context)
    activateworkspaceview(context)
    activatemountainview(context)
    activateaveragewaveforms(context)
    activateclusters(context)
    activatecorrelograms(context)
    activateelectrodegeometry(context)
    activatefiretrack(context)
    activatepythonsnippets(context)
    activatesnippets(context)
    activatespikeamplitudes(context)
    activatetimeseries(context)
    activateunitstable(context)
    // !end-code-generation!
}

export default registerExtensions