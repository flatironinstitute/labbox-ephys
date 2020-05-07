import React from 'react'
import { Switch, Route } from "react-router-dom";
import ImportSortings from "./containers/ImportSortings";
import RecordingView from "./containers/RecordingView";
import SortingJobView from "./containers/SortingJobView";
import TimeseriesForRecordingView from "./containers/TimeseriesForRecordingView";
import ImportRecordings from "./containers/ImportRecordings";
import RunSpikeSortingForRecording from './containers/RunSpikeSortingForRecording';
import Home from "./components/Home";
import About from "./components/About";
import Prototypes from './components/Prototypes';
import Config from './components/Config';
import SortingView from './containers/SortingView';

const TestPage = () => {
    return <div>{`Test page`}</div>;
}

const Routes = () => {
    return (
        <Switch>
            <Route path="/about"><About /></Route>
            <Route path="/prototypes"><Prototypes /></Route>
            <Route path="/test"><TestPage /></Route>
            <Route path="/config"><Config /></Route>
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
                path="/sorting/:sortingId*"
                render={({ match }) => (
                    <SortingView sortingId={match.params.sortingId} />
                )}
            />
            <Route
                path="/timeseriesForRecording/:recordingId*"
                render={({ match }) => (
                    <TimeseriesForRecordingView recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/runSpikeSortingForRecording/:recordingId*"
                render={({ match }) => (
                    <RunSpikeSortingForRecording recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/sortingJob/:sortingJobId*"
                render={({ match }) => (
                    <SortingJobView sortingJobId={match.params.sortingJobId} />
                )}
            />
            <Route path="/"><Home /></Route>
        </Switch>
    );
}

export default Routes;