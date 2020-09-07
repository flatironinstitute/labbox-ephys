import React from 'react'
import { Switch, Route, Redirect } from "react-router-dom";
import ImportSortings from "./containers/ImportSortings";
import RecordingView from "./containers/RecordingView";
import SortingJobView from "./containers/SortingJobView";
import TimeseriesForRecordingView from "./containers/TimeseriesForRecordingView";
import ImportRecordings from "./containers/ImportRecordings";
import RunSpikeSortingForRecording from './containers/RunSpikeSortingForRecording';
//import Home from "./components/Home";
import About from "./components/About";
import Prototypes from './components/Prototypes';
import Config from './containers/Config';
import SortingView from './containers/SortingView';
import HitherJobMonitor from './containers/HitherJobMonitor';
import HomeDBC from './components/HomeDBC';
import NewHome from './components/NewHome'

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
                    <Config />
                )}
            />
            <Route
                path="/:documentId/hitherJobMonitor"
                render={({ match }) => (
                    <HitherJobMonitor />
                )}
            />
            <Route
                path="/:documentId/importRecordings"
                render={({ match }) => (
                    <ImportRecordings />
                )}
            />
            <Route
                path="/:documentId/importSortingsForRecording/:recordingId*"
                render={({ match }) => (
                    <ImportSortings recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/:documentId/recording/:recordingId*"
                render={({ match }) => (
                    <RecordingView recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/:documentId/sorting/:sortingId*"
                render={({ match }) => (
                    <SortingView sortingId={match.params.sortingId} />
                )}
            />
            <Route
                path="/:documentId/timeseriesForRecording/:recordingId*"
                render={({ match }) => (
                    <TimeseriesForRecordingView recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/:documentId/runSpikeSortingForRecording/:recordingId*"
                render={({ match }) => (
                    <RunSpikeSortingForRecording recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/:documentId/sortingJob/:sortingJobId*"
                render={({ match }) => (
                    <SortingJobView sortingJobId={match.params.sortingJobId} />
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
                    <NewHome />
                )}
            />
            <Route path="/"><Redirect to="/default" /></Route>
        </Switch>
    );
}

export default Routes;