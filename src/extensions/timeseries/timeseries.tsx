// LABBOX-EXTENSION: timeseries

import React, { FunctionComponent } from 'react';
import sizeMe, { SizeMeProps } from "react-sizeme";
import TimeseriesViewNew from "../../components/TimeseriesViewNew/TimeseriesViewNew";
import { ExtensionContext, RecordingViewProps, SortingViewProps } from "../../extension";

const TimeseriesSortingView: FunctionComponent<SortingViewProps & SizeMeProps> = ({recording, size}) => {
    const height = 650 // hard-coded for now
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            width={size.width || 0}
            height={height}
        />
    )
}

const TimeseriesRecordingView: FunctionComponent<RecordingViewProps & SizeMeProps> = ({recording, size}) => {
    const height = 650 // hard-coded for now
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            width={size.width || 0}
            height={height}
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