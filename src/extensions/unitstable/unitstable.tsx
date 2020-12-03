// LABBOX-EXTENSION: unitstable

import { ExtensionContext } from "../../extension";
import Units from './Units/Units';

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'Units',
        label: 'Units Table',
        priority: 1000,
        component: Units
    })
}