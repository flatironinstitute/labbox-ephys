// LABBOX-EXTENSION: unitstable
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from "../extensionInterface";
import registerMetricPlugins from "./Units/metricPlugins/registerMetricPlugins";
import Units from './Units/Units';

export function activate(context: ExtensionContext) {
    registerMetricPlugins(context)

    context.registerSortingView({
        name: 'UnitsTable',
        label: 'Units Table',
        priority: 1000,
        component: Units
    })
}