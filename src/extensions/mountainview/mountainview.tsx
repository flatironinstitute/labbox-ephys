// LABBOX-EXTENSION: mountainview
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from '../extensionInterface';
import MountainView from './MountainView/MountainView';

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'MountainView',
        label: 'MountainView',
        priority: 5000,
        defaultExpanded: true,
        component: MountainView
    })
}