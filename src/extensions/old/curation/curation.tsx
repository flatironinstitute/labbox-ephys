// LABBOX-EXTENSION: curation
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from '../../extensionInterface';
import CurationSortingView from './CurationSortingView/CurationSortingView';

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'CurationSortingView',
        label: 'Curation (WIP)',
        fullWidth: true,
        defaultExpanded: false,
        development: true,
        priority: 1000,
        component: CurationSortingView,
        props: {
            height: 1000
        },
        singleton: true
    })
}