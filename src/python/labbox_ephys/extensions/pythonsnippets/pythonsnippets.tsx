// LABBOX-EXTENSION: pythonsnippets
// LABBOX-EXTENSION-TAGS:

import SubjectIcon from '@material-ui/icons/Subject';
import React from 'react';
import { LabboxExtensionContext } from "../pluginInterface";
import LoadSortingPythonSnippet from './LoadSortingPythonSnippet/LoadSortingPythonSnippet';

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'SortingView',
        name: 'LoadSortingInPython',
        label: 'Load sorting in Python',
        priority: 0,
        component: LoadSortingPythonSnippet,
        singleton: true,
        icon: <SubjectIcon />
    })
}