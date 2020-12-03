// LABBOX-EXTENSION: unitstable

import { ExtensionContext } from "../../extension";
import registerMetricPlugins from "./Units/metricPlugins/registerMetricPlugins";
import Units from './Units/Units';

export function activate(context: ExtensionContext) {
    registerMetricPlugins(context)

    context.registerSortingView({
        name: 'Units',
        label: 'Units Table',
        priority: 1000,
        component: Units
    })
}