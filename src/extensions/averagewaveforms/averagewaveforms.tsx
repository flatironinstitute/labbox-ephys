// LABBOX-EXTENSION: averagewaveforms

import { ExtensionContext } from "../../extension";
import AverageWaveformsNew from "./AverageWaveformsNew";
import AverageWaveformSortingUnitView from "./AverageWaveformSortingUnitView";
import { default as AverageWaveforms } from "./AverageWaveformsSortingView";

export function activate(context: ExtensionContext) {
    context.registerSortingUnitView({
        name: 'AverageWaveformSortingUnitView',
        label: 'Average Waveform',
        component: AverageWaveformSortingUnitView
    })
    context.registerSortingView({
        name: 'AverageWaveformsNew',
        label: 'Average waveforms new',
        component: AverageWaveformsNew
    })
    context.registerSortingView({
        name: 'AverageWaveforms',
        label: 'Average waveforms',
        priority: 90,
        component: AverageWaveforms
    })
}