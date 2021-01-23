// LABBOX-EXTENSION: firetrack
// LABBOX-EXTENSION-TAGS: jupyter

import GrainIcon from '@material-ui/icons/Grain';
import React from 'react';
import { ExtensionContext } from '../extensionInterface';
import FireTrackView from './FireTrackView/FireTrackView';

export function activate(context: ExtensionContext) {
    // Use registerrecordingview or registersortingview snippet to insert a recording or sorting view
    context.registerSortingView({
        name: 'FireTrack',
        label: 'FireTrack',
        priority: 50,
        component: FireTrackView,
        icon: <GrainIcon />
    })
}