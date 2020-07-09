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
import HomeDBC from './components/HomeDBC';

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
                path="/:documentId/config"
                render={({ match }) => (
                    <Config documentId={match.params.documentId} />
                )}
            />
            <Route
                path="/:documentId/hitherJobMonitor"
                render={({ match }) => (
                    <HitherJobMonitor documentId={match.params.documentId} />
                )}
            />
            <Route
                path="/:documentId/importRecordings"
                render={({ match }) => (
                    <ImportRecordings documentId={match.params.documentId} />
                )}
            />
            <Route
                path="/:documentId/importSortingsForRecording/:recordingId*"
                render={({ match }) => (
                    <ImportSortings recordingId={match.params.recordingId} documentId={match.params.documentId} />
                )}
            />
            <Route
                path="/:documentId/recording/:recordingId*"
                render={({ match }) => (
                    <RecordingView recordingId={match.params.recordingId} documentId={match.params.documentId} />
                )}
            />
            <Route
                path="/:documentId/sorting/:sortingId*"
                render={({ match }) => (
                    <SortingView sortingId={match.params.sortingId} documentId={match.params.documentId} />
                )}
            />
            <Route
                path="/:documentId/timeseriesForRecording/:recordingId*"
                render={({ match }) => (
                    <TimeseriesForRecordingView recordingId={match.params.recordingId} documentId={match.params.documentId} />
                )}
            />
            <Route
                path="/:documentId/runSpikeSortingForRecording/:recordingId*"
                render={({ match }) => (
                    <RunSpikeSortingForRecording recordingId={match.params.recordingId} documentId={match.params.documentId} />
                )}
            />
            <Route
                path="/:documentId/sortingJob/:sortingJobId*"
                render={({ match }) => (
                    <SortingJobView sortingJobId={match.params.sortingJobId} documentId={match.params.documentId} />
                )}
            />
            <Route
                path="/:documentId/HomeDBC"
                render={({ match }) => (
                    <HomeDBC documentId={match.params.sortingJobId} />
                )}
            />
            <Route
                path="/:documentId"
                render={({ match }) => (
                    <Home documentId={match.params.sortingJobId} />
                )}
            />
            <Route path="/"><Redirect to="/default" /></Route>
        </Switch>
    );
}

export default Routes;