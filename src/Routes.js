import React, { useState, useEffect } from 'react'
import { Switch, Route } from "react-router-dom";
import ImportSortings from "./containers/ImportSortings";
import RecordingView from "./containers/RecordingView";
import TimeseriesForRecordingView from "./containers/TimeseriesForRecordingView";
import ImportRecordings from "./containers/ImportRecordings";
import Home from "./components/Home";
import About from "./components/About";
import { runHitherJob } from "./actions";

const TestPage = () => {
    const [pythonOutput, setPythonOutput] = useState('')

    const effect = async() => {
        if (!pythonOutput) {
            setPythonOutput('loading...');
            let output = await runHitherJob('test_python_call', {}, {}).wait()
            setPythonOutput(output);
        }
    }
    useEffect(() => {effect()});

    return <div>{`Test page... output from python ${pythonOutput}`}</div>;
}

const Routes = () => {
    return (
        <Switch>
            <Route path="/about"><About /></Route>
            <Route path="/test"><TestPage /></Route>
            {/* <Route path="/config"><Config /></Route> */}
            <Route path="/importRecordings"><ImportRecordings /></Route>
            <Route
                path="/importSortingsForRecording/:recordingId*"
                render={({ match }) => (
                    <ImportSortings recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/recording/:recordingId*"
                render={({ match }) => (
                    <RecordingView recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/timeseriesForRecording/:recordingId*"
                render={({ match }) => (
                    <TimeseriesForRecordingView recordingId={match.params.recordingId} />
                )}
            />
            <Route path="/"><Home /></Route>
        </Switch>
    );
}

export default Routes;