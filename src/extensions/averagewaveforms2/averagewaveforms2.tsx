// LABBOX-EXTENSION: averagewaveforms2
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from "../extensionInterface";
import AverageWaveformsView from './AverageWaveformsView/AverageWaveformsView';

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'AverageWaveforms2',
        label: 'Average waveforms 2',
        priority: 350,
        defaultExpanded: true,
        component: AverageWaveformsView
    })
}