// LABBOX-EXTENSION: averagewaveformsold
// LABBOX-EXTENSION-TAGS: jupyter

import { LabboxExtensionContext } from "../../pluginInterface";
import AverageWaveformsNew from "./AverageWaveformsNew";
import AverageWaveformSortingUnitView from "./AverageWaveformSortingUnitView";
import { default as AverageWaveforms } from "./AverageWaveformsSortingView";

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'SortingUnitView',
        name: 'AverageWaveformSortingUnitViewOld',
        label: 'Average Waveform old',
        development: true,
        component: AverageWaveformSortingUnitView
    })
    context.registerPlugin({
        type: 'SortingView',
        name: 'AverageWaveformsNewOld',
        label: 'Average waveforms old',
        component: AverageWaveformsNew,
        development: true,
        singleton: true
    })
    context.registerPlugin({
        type: 'SortingView',
        name: 'AverageWaveformsOld',
        label: 'Average waveforms old',
        priority: 50,
        development: true,
        component: AverageWaveforms,
        singleton: true
    })
}