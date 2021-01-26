import React, { FunctionComponent } from 'react';
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
>>>>>>> workspace view and simplified state flow
import { useLocation } from "react-router-dom";
import { WorkspaceInfo } from './AppContainer';
import About from './components/About';
import Docs from './components/Docs';
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
=======
import { Redirect, Route, Switch } from "react-router-dom";
import About from "./components/About";
import Docs from "./components/Docs";
>>>>>>> import recordings view python scripts
=======
>>>>>>> workspace view and simplified state flow
import HitherJobMonitor from './components/HitherJobMonitor/HitherJobMonitor';
import Config from './containers/Config';
import Home from "./containers/Home";

const Routes: FunctionComponent<{width: number, height: number, workspaceInfo: WorkspaceInfo}> = ({width, height, workspaceInfo}) => {
    const location = useLocation()
    const pathList = location.pathname.split('/')
    const { page, workspaceName} = (
        (['docs', 'about'].includes(pathList[1])) ? ({
            workspaceName: 'default',
            page: pathList[1]
        }) : ({
            workspaceName: pathList[1] || 'default',
            page: pathList[2] || ''
        })
    )
    if (workspaceName !== workspaceInfo.workspaceName) throw Error('Unexpected mismatch in workspaceName')

<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
>>>>>>> workspace view and simplified state flow
    switch(page) {
        case 'about': return <About />
        case 'docs': return <Docs />
        case 'config': return <Config workspaceInfo={workspaceInfo} />
        case 'hitherJobMonitor': return <HitherJobMonitor />
        default: return <Home width={width} height={height} workspaceInfo={workspaceInfo} />
    }
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
=======
const Routes: FunctionComponent<{width: number, height: number}> = ({width, height}) => {
    return (
        <Switch>
            <Route path="/about"><About /></Route>
            <Route path="/docs"><Docs /></Route>
            <Route path="/test"><TestPage /></Route>
            <Route
                path="/:workspaceName/config"
                render={({ match }) => (
                    <Config />
                )}
            />
            <Route
                path="/:workspaceName/hitherJobMonitor"
                render={({ match }) => (
                    <HitherJobMonitor />
                )}
            />
            <Route
                path="/:workspaceName/importRecordings"
                render={({ match }) => (
                    <ImportRecordings />
                )}
            />
            <Route
                path="/:workspaceName/importSortingsForRecording/:recordingId*"
                render={({ match }) => (
                    <ImportSortings recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/:workspaceName/recording/:recordingId*"
                render={({ match }) => (
                    <RecordingView recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/:workspaceName/sorting/:sortingId*"
                render={({ match }) => (
                    <SortingView sortingId={match.params.sortingId} width={width} height={height} />
                )}
            />
            <Route
                path="/:workspaceName/sortingUnit/:sortingId/:unitId"
                render={({ match }) => (
                    <SortingUnitView sortingId={match.params.sortingId} unitId={parseInt(match.params.unitId)} />
                )}
            />
            <Route
                path="/:workspaceName/timeseriesForRecording/:recordingId*"
                render={({ match }) => (
                    <TimeseriesForRecordingView recordingId={match.params.recordingId} />
                )}
            />
            <Route
                path="/:workspaceName"
                render={({ match }) => (
                    <Home width={width} height={height} />
                )}
            />
            <Route path="/"><Redirect to="/default" /></Route>
        </Switch>
    );
>>>>>>> import recordings view python scripts
=======
>>>>>>> workspace view and simplified state flow
}

export default Routes;