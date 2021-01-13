// LABBOX-EXTENSION: averagewaveformsold
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from "../../extensionInterface";
import AverageWaveformsNew from "./AverageWaveformsNew";
import AverageWaveformSortingUnitView from "./AverageWaveformSortingUnitView";
import { default as AverageWaveforms } from "./AverageWaveformsSortingView";

export function activate(context: ExtensionContext) {
    context.registerSortingUnitView({
        name: 'AverageWaveformSortingUnitViewOld',
        label: 'Average Waveform old',
        development: true,
        component: AverageWaveformSortingUnitView
    })
    context.registerSortingView({
        name: 'AverageWaveformsNewOld',
        label: 'Average waveforms old',
        component: AverageWaveformsNew,
        development: true,
        singleton: true
    })
    context.registerSortingView({
        name: 'AverageWaveformsOld',
        label: 'Average waveforms old',
        priority: 50,
        development: true,
        component: AverageWaveforms,
        singleton: true
    })
}