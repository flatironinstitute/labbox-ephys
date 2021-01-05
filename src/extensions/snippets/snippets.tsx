// LABBOX-EXTENSION: snippets
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from '../extensionInterface';
import SnippetsView from './SnippetsView/SnippetsView';

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'SnippetsView',
        label: 'Snippets',
        priority: 50,
        component: SnippetsView
    })
}