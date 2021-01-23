// LABBOX-EXTENSION: spikeamplitudes
// LABBOX-EXTENSION-TAGS: jupyter

import ScatterPlotIcon from '@material-ui/icons/ScatterPlot';
import React from 'react';
import { ExtensionContext } from '../extensionInterface';
import SpikeAmplitudesUnitView from './SpikeAmplitudesView/SpikeAmplitudesUnitView';
import SpikeAmplitudesView from './SpikeAmplitudesView/SpikeAmplitudesView';


export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'SpikeAmplitudes',
        label: 'Spike amplitudes',
        priority: 50,
        defaultExpanded: false,
        component: SpikeAmplitudesView,
        singleton: false,
        icon: <ScatterPlotIcon />
    })
    context.registerSortingUnitView({
        name: 'SpikeAmplitudes',
        label: 'Spike amplitudes',
        priority: 50,
        fullWidth: true,
        component: SpikeAmplitudesUnitView,
        icon: <ScatterPlotIcon />
    })
}