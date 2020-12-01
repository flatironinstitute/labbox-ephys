import React from 'react';
import { Redirect, Route, Switch } from "react-router-dom";
import About from "./components/About";
import Home from "./components/Home";
import Prototypes from './components/Prototypes';
import Config from './containers/Config';
import HitherJobMonitor from './containers/HitherJobMonitor';
import ImportRecordings from "./containers/ImportRecordings";
import ImportSortings from "./containers/ImportSortings";
import RecordingView from "./containers/RecordingView";
import SortingUnitView from './containers/SortingUnitView';
import SortingView from './containers/SortingView';
import TimeseriesForRecordingView from "./containers/TimeseriesForRecordingView";

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
            <Route
                path="/:documentId"
                render={({ match }) => (
                    <Home />
                )}
            />
            <Route path="/"><Redirect to="/default" /></Route>
        </Switch>
    );
}

export default Routes;