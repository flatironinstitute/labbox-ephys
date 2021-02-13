// LABBOX-EXTENSION: firetrack
// LABBOX-EXTENSION-TAGS: jupyter

import GrainIcon from '@material-ui/icons/Grain';
import React from 'react';
import { LabboxExtensionContext } from "../pluginInterface";
import FireTrackView from './FireTrackView/FireTrackView';

export function activate(context: LabboxExtensionContext) {
    // Use registerrecordingview or registersortingview snippet to insert a recording or sorting view
    context.registerPlugin({
        type: 'SortingView',
        name: 'FireTrack',
        label: 'FireTrack',
        priority: 50,
        component: FireTrackView,
        icon: <GrainIcon />
    })
}