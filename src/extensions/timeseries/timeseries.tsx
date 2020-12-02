// LABBOX-EXTENSION: timeseries

import React, { FunctionComponent } from 'react';
import sizeMe from "react-sizeme";
import TimeseriesViewNew from "../../components/TimeseriesViewNew/TimeseriesViewNew";
import { ExtensionContext, RecordingViewProps, SortingViewProps } from "../../extension";

const TimeseriesSortingView: FunctionComponent<SortingViewProps & {size: {width: number}}> = ({recording, size}) => {
    const height = 650 // hard-coded for now
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            width={size.width}
            height={height}
        />
    )
}

const TimeseriesRecordingView: FunctionComponent<RecordingViewProps & {size: {width: number}}> = ({recording, size}) => {
    const height = 650 // hard-coded for now
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            width={size.width}
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