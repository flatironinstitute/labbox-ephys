// LABBOX-EXTENSION: averagewaveforms

import { ExtensionContext } from "../../extension";
import AverageWaveformSortingUnitView from "./AverageWaveformSortingUnitView";

export function activate(context: ExtensionContext) {
    context.registerSortingUnitView({
        name: 'AverageWaveformSortingUnitView',
        label: 'Average Waveform',
        component: AverageWaveformSortingUnitView
    })
}