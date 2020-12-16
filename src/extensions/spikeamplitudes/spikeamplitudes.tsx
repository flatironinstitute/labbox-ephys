// LABBOX-EXTENSION: spikeamplitudes
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from '../extensionInterface';
import SpikeAmplitudesUnitView from './SpikeAmplitudesView/SpikeAmplitudesUnitView';
import SpikeAmplitudesView from './SpikeAmplitudesView/SpikeAmplitudesView';


export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'SpikeAmplitudes',
        label: 'Spike amplitudes',
        priority: 500,
        defaultExpanded: false,
        component: SpikeAmplitudesView,
        singleton: false
    })
    context.registerSortingUnitView({
        name: 'SpikeAmplitudes',
        label: 'Spike amplitudes',
        priority: 0,
        fullWidth: true,
        component: SpikeAmplitudesUnitView
    })
}