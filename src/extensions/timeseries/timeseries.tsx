// LABBOX-EXTENSION: timeseries
// LABBOX-EXTENSION-TAGS: jupyter

import React, { FunctionComponent } from 'react';
import { ExtensionContext, RecordingViewProps, SortingViewProps } from "../extensionInterface";
import TimeseriesViewNew from './TimeseriesViewNew/TimeseriesViewNew';

const TimeseriesSortingView: FunctionComponent<SortingViewProps> = ({recording, hither, width, height, selection, selectionDispatch}) => {
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            recordingInfo={recording.recordingInfo}
            width={width || 600}
            height={height || 600}
            hither={hither}
            opts={{channelSelectPanel: true}}
            recordingSelection={selection}
            recordingSelectionDispatch={selectionDispatch}
        />
    )
}

const TimeseriesRecordingView: FunctionComponent<RecordingViewProps> = ({recording, hither, width, height, recordingSelection, recordingSelectionDispatch}) => {
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            recordingInfo={recording.recordingInfo}
            width={width || 600}
            height={height || 600}
            hither={hither}
            opts={{channelSelectPanel: true}}
            recordingSelection={recordingSelection}
            recordingSelectionDispatch={recordingSelectionDispatch}
        />
    )
}

export function activate(context: ExtensionContext) {
    context.registerRecordingView({
        name: 'TimeseriesView',
        label: 'Timeseries',
        priority: 50,
        fullWidth: true,
        component: TimeseriesRecordingView,
    })
    context.registerSortingView({
        name: 'TimeseriesView',
        label: 'Timeseries',
        priority: 50,
        component: TimeseriesSortingView
    })
}