// LABBOX-EXTENSION: timeseries

import React, { FunctionComponent } from 'react';
import sizeMe, { SizeMeProps } from "react-sizeme";
import { ExtensionContext, RecordingViewProps, SortingViewProps } from "../extensionInterface";
import TimeseriesViewNew from './TimeseriesViewNew/TimeseriesViewNew';

const TimeseriesSortingView: FunctionComponent<SortingViewProps & SizeMeProps> = ({recording, size, hither}) => {
    const height = 650 // hard-coded for now
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            width={size.width || 0}
            height={height}
            hither={hither}
        />
    )
}

const TimeseriesRecordingView: FunctionComponent<RecordingViewProps & SizeMeProps> = ({recording, size, hither}) => {
    const height = 650 // hard-coded for now
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            width={size.width || 0}
            height={height}
            hither={hither}
        />
    )
}

export function activate(context: ExtensionContext) {
    context.registerRecordingView({
        name: 'TimeseriesView',
        label: 'Timeseries',
        priority: 50,
        fullWidth: true,
        component: sizeMe()(TimeseriesRecordingView)
    })
    context.registerSortingView({
        name: 'TimeseriesView',
        label: 'Timeseries',
        priority: 50,
        component: sizeMe()(TimeseriesSortingView)
    })
}