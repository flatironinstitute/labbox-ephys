import React from 'react'
import { Switch, Route, Redirect } from "react-router-dom";
import ImportSortings from "./containers/ImportSortings";
import RecordingView from "./containers/RecordingView";
import SortingJobView from "./containers/SortingJobView";
import TimeseriesForRecordingView from "./containers/TimeseriesForRecordingView";
import ImportRecordings from "./containers/ImportRecordings";
import RunSpikeSortingForRecording from './containers/RunSpikeSortingForRecording';
import Home from "./components/Home";
import About from "./components/About";
import Prototypes from './components/Prototypes';
import Config from './containers/Config';
import SortingView from './containers/SortingView';
import HitherJobMonitor from './containers/HitherJobMonitor';
import DbcRecordingsView from './containers/DbcRecordingsView';

const TestPage = () => {
    return <div>{`Test page`}</div>;
}

const Routes = () => {
    return (
        <Switch>
            <Route path="/about"><About /></Route>
            <Route path="/prototypes"><Prototypes /></Route>
            <Route path="/test"><TestPage /></Route>
            <Route
                path="/f/:feedId/d/:documentId/config"
                render={({ match }) => (
                    <Config />
                )}
            />
            <Route
                path="/f/:feedId/d/:documentId/hitherJobMonitor"
                render={({ match }) => (
                    <HitherJobMonitor />
                )}
            />
            <Route
                path="/f/:feedId/d/:documentId/importRecordings"
                render={({ match }) => (
                    <ImportRecordings />
                )}
            />
            <Route
                path="/f/:feedId/d/:documentId/importSortingsForRecording/:recordingId*"
                render={({ match }) => (
                    <ImportSortings recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/f/:feedId/d/:documentId/recording/:recordingId*"
                render={({ match }) => (
                    <RecordingView recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/f/:feedId/d/:documentId/sorting/:sortingId*"
                render={({ match }) => (
                    <SortingView sortingId={match.params.sortingId} />
                )}
            />
            <Route
                path="/f/:feedId/d/:documentId/timeseriesForRecording/:recordingId*"
                render={({ match }) => (
                    <TimeseriesForRecordingView recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/f/:feedId/d/:documentId/runSpikeSortingForRecording/:recordingId*"
                render={({ match }) => (
                    <RunSpikeSortingForRecording recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/f/:feedId/d/:documentId/sortingJob/:sortingJobId*"
                render={({ match }) => (
                    <SortingJobView sortingJobId={match.params.sortingJobId} />
                )}
            />
            <Route
                path="/f/:feedId/d/:documentId/dbcRecordingsView"
                render={({ match }) => (
                    <DbcRecordingsView />
                )}
            />
            <Route
                path="/f/:feedId/d/:documentId"
                render={({ match }) => (
                    <Home />
                )}
            />
            <Route path="/"><Redirect to="/f/default/d/default" /></Route>
        </Switch>
    );
}

export default Routes;