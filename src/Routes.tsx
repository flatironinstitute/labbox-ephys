import React, { FunctionComponent } from 'react';
import { Redirect, Route, Switch } from "react-router-dom";
import About from "./components/About";
import Docs from "./components/Docs";
import Config from './containers/Config';
import HitherJobMonitor from './components/HitherJobMonitor/HitherJobMonitor';
import Home from "./containers/Home";
import ImportRecordings from "./containers/ImportRecordings";
import ImportSortings from "./containers/ImportSortings";
import RecordingView from "./containers/RecordingView";
import SortingUnitView from './containers/SortingUnitView';
import SortingView from './containers/SortingView';
import TimeseriesForRecordingView from "./containers/TimeseriesForRecordingView";

const TestPage = () => {
    return <div>{`Test page`}</div>;
}

const Routes: FunctionComponent<{width: number, height: number}> = ({width, height}) => {
    return (
        <Switch>
            <Route path="/about"><About /></Route>
            <Route path="/docs"><Docs /></Route>
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
                    <SortingView sortingId={match.params.sortingId} width={width} height={height} />
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