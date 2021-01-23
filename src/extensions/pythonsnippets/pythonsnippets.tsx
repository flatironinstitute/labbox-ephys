// LABBOX-EXTENSION: pythonsnippets
// LABBOX-EXTENSION-TAGS:

import SubjectIcon from '@material-ui/icons/Subject';
<<<<<<< 15daa83a6aeb9e1d05819a26b42a20c39f000c69
import React from 'react';
=======
>>>>>>> styling adjustments
import { ExtensionContext } from "../extensionInterface";
import LoadSortingPythonSnippet from './LoadSortingPythonSnippet/LoadSortingPythonSnippet';

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'LoadSortingInPython',
        label: 'Load sorting in Python',
        priority: 0,
        component: LoadSortingPythonSnippet,
        singleton: true,
        icon: <SubjectIcon />
    })
}