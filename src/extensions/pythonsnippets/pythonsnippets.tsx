// LABBOX-EXTENSION: pythonsnippets
// LABBOX-EXTENSION-TAGS:

import { ExtensionContext } from "../extensionInterface";
import LoadSortingPythonSnippet from './LoadSortingPythonSnippet/LoadSortingPythonSnippet';

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'LoadSortingInPython',
        label: 'Load sorting in Python',
        priority: 10,
        component: LoadSortingPythonSnippet,
        singleton: true
    })
}