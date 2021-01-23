// LABBOX-EXTENSION: clusters
// LABBOX-EXTENSION-TAGS: jupyter

import { BubbleChart } from '@material-ui/icons';
import { ExtensionContext } from '../extensionInterface';
import IndividualClustersView from './IndividualClustersView/IndividualClustersView';

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'IndividualClustersView',
        label: 'Clusters',
        priority: 50,
        component: IndividualClustersView,
        icon: <BubbleChart />
    })
}