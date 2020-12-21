// LABBOX-EXTENSION: averagewaveforms
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from "../extensionInterface";
import AverageWaveformsView from './AverageWaveformsView/AverageWaveformsView';

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'AverageWaveforms',
        label: 'Average waveforms',
        priority: 350,
        defaultExpanded: false,
        component: AverageWaveformsView,
        singleton: true
    })
}