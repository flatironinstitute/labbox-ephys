
// !begin-code-generation!
import { ExtensionContext } from './extensions/extensionInterface';

import { activate as activatecorrelograms } from './extensions/correlograms/correlograms';
import { activate as activateexample } from './extensions/example/example';
import { activate as activatecuration } from './extensions/curation/curation';
import { activate as activatedevel } from './extensions/devel/devel';
import { activate as activateelectrodegeometry } from './extensions/electrodegeometry/electrodegeometry';
import { activate as activatetimeseries } from './extensions/timeseries/timeseries';
import { activate as activateaveragewaveforms } from './extensions/averagewaveforms/averagewaveforms';
import { activate as activateunitstable } from './extensions/unitstable/unitstable';
// !end-code-generation!

const registerExtensions = (context: ExtensionContext) => {
    // !begin-code-generation!
    activatecorrelograms(context)
    activateexample(context)
    activatecuration(context)
    activatedevel(context)
    activateelectrodegeometry(context)
    activatetimeseries(context)
    activateaveragewaveforms(context)
    activateunitstable(context)
    // !end-code-generation!
}

export default registerExtensions

// !note! This file involves code generation.
// !note! The following template file was used: ./jupyterlab/labbox_ephys_widgets_jp/src/registerExtensions.tsx.j2
// !note! You may edit the generated file outside of the code-generation blocks.
// !note! Changes to the generated file will be updated in the template file.
// !note! If vscode automatically moves the code-generation block delimiters upon save, just manually move them back and re-save
