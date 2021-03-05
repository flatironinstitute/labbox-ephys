
// !begin-code-generation!
import { ExtensionContext } from './extensions/pluginInterface';

import { activate as activatemountainview } from './python/labbox_ephys/extensions/mountainview/mountainview'
import { activate as activatedevel } from './python/labbox_ephys/extensions/devel/devel'
import { activate as activatespikeamplitudes } from './python/labbox_ephys/extensions/spikeamplitudes/spikeamplitudes'
import { activate as activatecorrelograms } from './python/labbox_ephys/extensions/correlograms/correlograms'
import { activate as activatefiretrack } from './python/labbox_ephys/extensions/firetrack/firetrack'
import { activate as activatetimeseries } from './python/labbox_ephys/extensions/timeseries/timeseries'
import { activate as activateelectrodegeometry } from './python/labbox_ephys/extensions/electrodegeometry/electrodegeometry'
import { activate as activatesnippets } from './python/labbox_ephys/extensions/snippets/snippets'
import { activate as activateexample } from './python/labbox_ephys/extensions/example/example'
import { activate as activateaveragewaveformsold } from './python/labbox_ephys/extensions/old/averagewaveformsold/averagewaveformsold'
import { activate as activateclusters } from './python/labbox_ephys/extensions/clusters/clusters'
import { activate as activateunitstable } from './python/labbox_ephys/extensions/unitstable/unitstable'
import { activate as activateaveragewaveforms } from './python/labbox_ephys/extensions/averagewaveforms/averagewaveforms'
// !end-code-generation!

const registerExtensions = (context: LabboxExtensionContext) => {
    // !begin-code-generation!
    activatemountainview(context)
    activatedevel(context)
    activatespikeamplitudes(context)
    activatecorrelograms(context)
    activatefiretrack(context)
    activatetimeseries(context)
    activateelectrodegeometry(context)
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
// !note! The following template file was used: ./jupyterlab/labbox_ephys_widgets_jp/src/registerExtensions.tsx.j2
// !note! You may edit the generated file outside of the code-generation blocks.
// !note! Changes to the generated file will be updated in the template file.
// !note! If vscode automatically moves the code-generation block delimiters upon save, just manually move them back and re-save
