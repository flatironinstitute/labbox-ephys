
import { ExtensionContext } from "./extension"
// !begin-code-generation!
import { activate as activateLoadSortingPythonSnippet } from './pluginComponents/LoadSortingPythonSnippet/LoadSortingPythonSnippet'
import { activate as activateUnits } from './pluginComponents/Units/Units'
import { activate as activateCrossCorrelograms } from './pluginComponents/CrossCorrelograms/CrossCorrelograms'
import { activate as activateAverageWaveformsNew } from './pluginComponents/AverageWaveformsNew/AverageWaveformsNew'
import { activate as activateAverageWaveforms } from './pluginComponents/AverageWaveforms/AverageWaveforms'
import { activate as activateAutocorrelograms } from './pluginComponents/AutoCorrelograms/AutoCorrelograms'
import { activate as activateIndividualUnits } from './pluginComponents/IndividualUnits/IndividualUnits'
import { activate as activateElectrodeGeometryTest2 } from './pluginComponents/ElectrodeGeometryTest2/ElectrodeGeometryTest2'
import { activate as activateElectrodeGeometryTest } from './pluginComponents/ElectrodeGeometryTest/ElectrodeGeometryTest'
// !end-code-generation!

/*
Extensions are automatically detected and added to this file via code generation (see task configured in vscode)
They must be .tsx files with the following appearing at the top of the file
// LABBOX-EXTENSION: <name>
And they must include an activate() function
*/

const registerExtensions = (context: ExtensionContext) => {
    // !begin-code-generation!
    activateLoadSortingPythonSnippet(context)
    activateUnits(context)
    activateCrossCorrelograms(context)
    activateAverageWaveformsNew(context)
    activateAverageWaveforms(context)
    activateAutocorrelograms(context)
    activateIndividualUnits(context)
    activateElectrodeGeometryTest2(context)
    activateElectrodeGeometryTest(context)
    // !end-code-generation!
    ///////////////////////////////////////////////
}

export default registerExtensions

// !note! This file involves code generation.
// !note! The following template file was used: ./src/registerExtensions.ts.j2
// !note! You may edit the generated file outside of the code-generation blocks.
// !note! Changes to the generated file will be updated in the template file.
// !note! If vscode automatically moves the code-generation block delimiters upon save, just manually move them back and re-save
