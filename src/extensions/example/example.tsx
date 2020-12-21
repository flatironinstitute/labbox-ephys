// LABBOX-EXTENSION: example
// LABBOX-EXTENSION-TAGS: jupyter

import React, { FunctionComponent } from 'react';
import { ExtensionContext, RecordingViewProps } from "../extensionInterface";

// Use recordingview snippet to insert a recording view
const ExampleRecordingView: FunctionComponent<RecordingViewProps> = ({recording}) => {
    return (
        <div>
            Example recording view. Recording ID: {recording.recordingId}
        </div>
    )
}

export function activate(context: ExtensionContext) {
    // Use registerrecordingview snippet to register a recording view
    context.registerRecordingView({
        name: 'ExampleRecordingView',
        label: 'Example recording view',
        priority: 50,
        development: true,
        disabled: true,
        component: ExampleRecordingView
    })
}