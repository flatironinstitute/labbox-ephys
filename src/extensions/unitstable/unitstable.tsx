// LABBOX-EXTENSION: unitstable
// LABBOX-EXTENSION-TAGS: jupyter

import TableChartIcon from '@material-ui/icons/TableChart';
import React from 'react';
import { ExtensionContext } from "../extensionInterface";
import registerMetricPlugins from "./Units/metricPlugins/registerMetricPlugins";
import Units from './Units/Units';

export function activate(context: ExtensionContext) {
    registerMetricPlugins(context)

    context.registerSortingView({
        name: 'UnitsTable',
        label: 'Units Table',
        icon: <TableChartIcon />,
        priority: 200,
        component: Units,
        props: {
            maxHeight: 300
        },
        singleton: true
    })
}