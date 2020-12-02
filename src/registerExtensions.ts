// *******************************************************************************
// This file was automatically generated from registerExtensions.j2, do not edit
// Extensions are identified by the following criteria:
//    - File name ends with .tsx
//    - Contains a line of the form ... LABBOX-EXTENSIONS <extension-name>
// *******************************************************************************

import { ExtensionContext } from "./extension"

import { activate as activateCrossCorrelograms } from './pluginComponents/CrossCorrelograms/CrossCorrelograms'
import { activate as activateAverageWaveformsNew } from './pluginComponents/AverageWaveformsNew/AverageWaveformsNew'
import { activate as activateAverageWaveforms } from './pluginComponents/AverageWaveforms/AverageWaveforms'
import { activate as activateAutocorrelograms } from './pluginComponents/AutoCorrelograms/AutoCorrelograms'
import { activate as activateElectrodeGeometryTest2 } from './pluginComponents/ElectrodeGeometryTest2/ElectrodeGeometryTest2'
import { activate as activateElectrodeGeometryTest } from './pluginComponents/ElectrodeGeometryTest/ElectrodeGeometryTest'


const registerExtensions = (context: ExtensionContext) => {
    
    activateCrossCorrelograms(context)
    activateAverageWaveformsNew(context)
    activateAverageWaveforms(context)
    activateAutocorrelograms(context)
    activateElectrodeGeometryTest2(context)
    activateElectrodeGeometryTest(context)
    
}

export default registerExtensions