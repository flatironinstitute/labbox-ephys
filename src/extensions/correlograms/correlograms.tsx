// LABBOX-EXTENSION: correlogram

import { ExtensionContext } from "../../extension";
import AutoCorrelograms from "./AutoCorrelograms";
import AutocorrelogramSortingUnitView from "./AutocorrelogramSortingUnitView";
import CrossCorrelograms from "./CrossCorrelograms";

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'Autocorrelograms2',
        label: 'Autocorrelograms',
        priority: 100,
        component: AutoCorrelograms
    })
    context.registerSortingView({
        name: 'CrossCorrelograms',
        label: 'Cross-Correlograms',
        component: CrossCorrelograms
    })
    context.registerSortingUnitView({
        name: 'AutocorrelogramSortingUnitView',
        label: 'Autocorrelogram',
        component: AutocorrelogramSortingUnitView
    })
}