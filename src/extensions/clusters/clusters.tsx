// LABBOX-EXTENSION: clusters
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from '../extensionInterface';
import SingleClustersView from './SingleClustersView/SingleClustersView';

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'SingleClustersView',
        label: 'Clusters',
        priority: 50,
        component: SingleClustersView
    })
}