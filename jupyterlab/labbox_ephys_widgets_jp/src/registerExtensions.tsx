
// !begin-code-generation!
import { ExtensionContext } from './extensions/extensionInterface';

import { activate as activatecorrelograms } from './extensions/correlograms/correlograms'
import { activate as activateexample } from './extensions/example/example'
import { activate as activatespikeamplitudes } from './extensions/spikeamplitudes/spikeamplitudes'
import { activate as activatedevel } from './extensions/devel/devel'
import { activate as activateelectrodegeometry } from './extensions/electrodegeometry/electrodegeometry'
import { activate as activatetimeseries } from './extensions/timeseries/timeseries'
import { activate as activateaveragewaveforms } from './extensions/averagewaveforms/averagewaveforms'
import { activate as activateunitstable } from './extensions/unitstable/unitstable'
import { activate as activatefiretrack } from './extensions/firetrack/firetrack'
import { activate as activatemountainview } from './extensions/mountainview/mountainview'
import { activate as activatecuration } from './extensions/old/curation/curation'
import { activate as activateaveragewaveformsold } from './extensions/old/averagewaveformsold/averagewaveformsold'
// !end-code-generation!

const registerExtensions = (context: ExtensionContext) => {
    // !begin-code-generation!
    activatecorrelograms(context)
    activateexample(context)
    activatespikeamplitudes(context)
    activatedevel(context)
    activateelectrodegeometry(context)
    activatetimeseries(context)
    activateaveragewaveforms(context)
    activateunitstable(context)
    activatefiretrack(context)
    activatemountainview(context)
    activatecuration(context)
    activateaveragewaveformsold(context)
    // !end-code-generation!
}

export default registerExtensions

// !note! This file involves code generation.
// !note! The following template file was used: ./jupyterlab/labbox_ephys_widgets_jp/src/registerExtensions.tsx.j2
// !note! You may edit the generated file outside of the code-generation blocks.
// !note! Changes to the generated file will be updated in the template file.
// !note! If vscode automatically moves the code-generation block delimiters upon save, just manually move them back and re-save
