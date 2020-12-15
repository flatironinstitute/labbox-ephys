// LABBOX-EXTENSION: correlograms
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from "../extensionInterface";
import AutoCorrelograms from "./AutoCorrelograms";
import AutocorrelogramSortingUnitView from "./AutocorrelogramSortingUnitView";
import CrossCorrelograms from "./CrossCorrelograms";

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'Autocorrelograms',
        label: 'Autocorrelograms',
        priority: 100,
        component: AutoCorrelograms,
        singleton: true
    })
    context.registerSortingView({
        name: 'CrossCorrelograms',
        label: 'Cross-Correlograms',
        component: CrossCorrelograms,
        singleton: false
    })
    context.registerSortingUnitView({
        name: 'AutocorrelogramSortingUnitView',
        label: 'Autocorrelogram',
        component: AutocorrelogramSortingUnitView
    })
}