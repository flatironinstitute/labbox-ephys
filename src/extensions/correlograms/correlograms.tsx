// LABBOX-EXTENSION: correlograms
// LABBOX-EXTENSION-TAGS: jupyter

import BarChartIcon from '@material-ui/icons/BarChart';
import React from 'react';
import { ExtensionContext } from "../extensionInterface";
import AutoCorrelograms from "./AutoCorrelograms";
import CrossCorrelogramsView from "./CrossCorrelogramsView/CrossCorrelogramsView";

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'Autocorrelograms',
        label: 'Autocorrelograms',
        priority: 50,
        component: AutoCorrelograms,
        icon: <BarChartIcon />,
        singleton: true
    })
    context.registerSortingView({
        name: 'CrossCorrelograms',
        label: 'Cross-Correlograms',
        component: CrossCorrelogramsView,
        icon: <BarChartIcon />,
        singleton: false
    })
}