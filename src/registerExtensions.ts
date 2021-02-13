
// !begin-code-generation!
import { activate as activateaveragewaveforms } from './extensions/averagewaveforms/averagewaveforms'
import { activate as activateclusters } from './extensions/clusters/clusters'
import { activate as activatecorrelograms } from './extensions/correlograms/correlograms'
import { activate as activatedevel } from './extensions/devel/devel'
import { activate as activateelectrodegeometry } from './extensions/electrodegeometry/electrodegeometry'
import { activate as activateexample } from './extensions/example/example'
import { activate as activatefiretrack } from './extensions/firetrack/firetrack'
import { ExtensionContext } from './extensions/labbox'
import { activate as activatemountainview } from './extensions/mountainview/mountainview'
import { activate as activateaveragewaveformsold } from './extensions/old/averagewaveformsold/averagewaveformsold'
import { LabboxPlugin } from './extensions/pluginInterface'
import { activate as activatepythonsnippets } from './extensions/pythonsnippets/pythonsnippets'
import { activate as activatesnippets } from './extensions/snippets/snippets'
import { activate as activatespikeamplitudes } from './extensions/spikeamplitudes/spikeamplitudes'
import { activate as activatetimeseries } from './extensions/timeseries/timeseries'
import { activate as activateunitstable } from './extensions/unitstable/unitstable'

// !end-code-generation!

/*
Extensions are automatically detected and added to this file via code generation (see task configured in vscode)
They must be .tsx files with the following appearing at the top of the file
// LABBOX-EXTENSION: <name>
And they must include an activate() function
Use the following to also include the extension in the jupyterlab extension:
// LABBOX-EXTENSION-TAGS: jupyter
*/


const registerExtensions = (context: ExtensionContext<LabboxPlugin>) => {
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
