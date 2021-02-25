
// !begin-code-generation!
import { activate as activateaveragewaveforms } from './python/labbox_ephys/extensions/averagewaveforms/averagewaveforms'
import { activate as activateclusters } from './python/labbox_ephys/extensions/clusters/clusters'
import { activate as activatecorrelograms } from './python/labbox_ephys/extensions/correlograms/correlograms'
import { activate as activatedevel } from './python/labbox_ephys/extensions/devel/devel'
import { activate as activateelectrodegeometry } from './python/labbox_ephys/extensions/electrodegeometry/electrodegeometry'
import { activate as activateexample } from './python/labbox_ephys/extensions/example/example'
import { activate as activatefiretrack } from './python/labbox_ephys/extensions/firetrack/firetrack'
import { activate as activatemountainview } from './python/labbox_ephys/extensions/mountainview/mountainview'
import { activate as activateaveragewaveformsold } from './python/labbox_ephys/extensions/old/averagewaveformsold/averagewaveformsold'
import { LabboxExtensionContext } from './python/labbox_ephys/extensions/pluginInterface'
import { activate as activatepythonsnippets } from './python/labbox_ephys/extensions/pythonsnippets/pythonsnippets'
import { activate as activatesnippets } from './python/labbox_ephys/extensions/snippets/snippets'
import { activate as activatespikeamplitudes } from './python/labbox_ephys/extensions/spikeamplitudes/spikeamplitudes'
import { activate as activatetimeseries } from './python/labbox_ephys/extensions/timeseries/timeseries'
import { activate as activateunitstable } from './python/labbox_ephys/extensions/unitstable/unitstable'

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
    activatemountainview(context)
    activatedevel(context)
    activatespikeamplitudes(context)
    activatecorrelograms(context)
    activatefiretrack(context)
    activatetimeseries(context)
    activateelectrodegeometry(context)
    activatepythonsnippets(context)
    activatesnippets(context)
    activateexample(context)
    activateaveragewaveformsold(context)
    activateclusters(context)
    activateunitstable(context)
    activateaveragewaveforms(context)
    // !end-code-generation!
}

export default registerExtensions

// !note! This file involves code generation.
// !note! The following template file was used: ./src/registerExtensions.ts.j2
// !note! You may edit the generated file outside of the code-generation blocks.
// !note! Changes to the generated file will be updated in the template file.
// !note! If vscode automatically moves the code-generation block delimiters upon save, just manually move them back and re-save
