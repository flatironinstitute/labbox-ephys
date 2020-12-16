// LABBOX-EXTENSION: mountainview
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from '../extensionInterface';
import MVSortingUnitView from './MVSortingUnitView/MVSortingUnitView';
import MVSortingView from './MVSortingView/MVSortingView';

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'MVSortingView',
        label: 'MVSortingView',
        priority: 5000,
        defaultExpanded: true,
        component: MVSortingView
    })
    context.registerSortingUnitView({
        name: 'MVSortingUnitView',
        label: 'MV sorting unit view',
        component: MVSortingUnitView
    })
}