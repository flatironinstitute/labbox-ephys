import React from 'react'
import { Switch, Route, Redirect } from "react-router-dom";
import ImportSortings from "./containers/ImportSortings";
import RecordingView from "./containers/RecordingView";
import NewRecordingView from "./components/NewRecordingView";
import SortingJobView from "./containers/SortingJobView";
import TimeseriesForRecordingView from "./containers/TimeseriesForRecordingView";
import ImportRecordings from "./containers/ImportRecordings";
import RunSpikeSortingForRecording from './containers/RunSpikeSortingForRecording';
// import Home from "./components/Home";
import About from "./components/About";
import Prototypes from './components/Prototypes';
import Config from './containers/Config';
import SortingView from './containers/SortingView';
import SortingUnitView from './containers/SortingUnitView';
import HitherJobMonitor from './containers/HitherJobMonitor';
import HomeDBC from './components/HomeDBC';
import NewHome from './components/NewHome'
import Login from './components/Login'
import PrivateRoute from './components/PrivateRoute'

const TestPage = () => {
    return <div>{`Test page`}</div>;
}

const Routes = () => {
    return (
        <Switch>
            <Route path="/login">
                <Login />
            </Route>
            <PrivateRoute path="/about"><About /></PrivateRoute>
            <PrivateRoute path="/prototypes"><Prototypes /></PrivateRoute>
            <PrivateRoute path="/test"><TestPage /></PrivateRoute>
            <PrivateRoute
                path="/:documentId/config"
                render={({ match }) => (
                    <Config />
                )}
            />
            <PrivateRoute
                path="/:documentId/hitherJobMonitor"
                render={({ match }) => (
                    <HitherJobMonitor />
                )}
            />
            <PrivateRoute
                path="/:documentId/importRecordings"
                render={({ match }) => (
                    <ImportRecordings />
                )}
            />
            <PrivateRoute
                path="/:documentId/importSortingsForRecording/:recordingId*"
                render={({ match }) => (
                    <ImportSortings recordingId={match.params.recordingId} />
                )}
            />
            <PrivateRoute
                path="/:documentId/recording/:recordingId*"
                render={({ match }) => (
                    //<RecordingView recordingId={match.params.recordingId} />
                    <NewRecordingView recordingId={match.params.recordingId} />
                )}
            />
            <PrivateRoute
                path="/:documentId/sorting/:sortingId*"
                render={({ match }) => (
                    <SortingView sortingId={match.params.sortingId} />
                )}
            />
            <PrivateRoute
                path="/:documentId/sortingUnit/:sortingId/:unitId"
                render={({ match }) => (
                    <SortingUnitView sortingId={match.params.sortingId} unitId={parseInt(match.params.unitId)} />
                )}
            />
            <Route
                path="/:documentId/timeseriesForRecording/:recordingId*"
                render={({ match }) => (
                    <TimeseriesForRecordingView recordingId={match.params.recordingId} />
                )}
            />
            <PrivateRoute
                path="/:documentId/runSpikeSortingForRecording/:recordingId*"
                render={({ match }) => (
                    <RunSpikeSortingForRecording recordingId={match.params.recordingId} />
                )}
            />
            <PrivateRoute
                path="/:documentId/sortingJob/:sortingJobId*"
                render={({ match }) => (
                    <SortingJobView sortingJobId={match.params.sortingJobId} />
                )}
            />
            <PrivateRoute
                path="/:documentId/HomeDBC"
                render={({ match }) => (
                    <HomeDBC documentId={match.params.sortingJobId} />
                )}
            />
            <PrivateRoute
                path="/:documentId"
                render={({ match }) => (
                    //<Home />
                    <NewHome />
                )}
            />
            <Route path="/"><Redirect to="/default" /></Route>
        </Switch>
    );
}


export default Routes;