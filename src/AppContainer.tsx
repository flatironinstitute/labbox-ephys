import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
// LABBOX-CUSTOM /////////////////////////////////////////////
import Typography from '@material-ui/core/Typography';
import { Home } from '@material-ui/icons';
import QueryString from 'querystring';
import React, { Dispatch, Fragment, FunctionComponent, useEffect, useState } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link, Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import sizeMe from 'react-sizeme';
import { setWorkspaceInfo } from './actions';
import HitherJobMonitorControl from './components/HitherJobMonitor/HitherJobMonitorControl';
import PersistStateControl from './containers/PersistStateControl';
import { HitherJob } from './extensions/common/hither';
import { ExtensionsConfig } from './extensions/reducers';
import { getPathQuery } from './kachery';
import { RootAction, RootState } from './reducers';
import { WorkspaceInfo } from './reducers/workspaceInfo';
import Routes from './Routes';


type ToolBarContentProps = {
    workspaceInfo: WorkspaceInfo
    extensionsConfig: ExtensionsConfig
    websocketStatus: string
}

const ToolBarContent: FunctionComponent<ToolBarContentProps> = ({ workspaceInfo, extensionsConfig, websocketStatus }) => {
    const { workspaceName, feedUri } = workspaceInfo;
    const hitherJobs: HitherJob[] = []
    return (
        <Fragment>
            <Button color="inherit" component={Link} to={`/${workspaceName}${getPathQuery({feedUri})}`}>
                <Home />&nbsp;
                <Typography variant="h6">
                    Labbox-ephys
                </Typography>
            </Button>
            <span style={{marginLeft: 'auto'}} />
            <Button color="inherit" component={Link} to="/docs" style={{marginLeft: 'auto'}}>Docs</Button>
            <Button color="inherit" component={Link} to={`/${workspaceName}/config${getPathQuery({feedUri})}`} >Config</Button>
            <Button color="inherit" component={Link} to="/about">About</Button>
            <PersistStateControl />
            <HitherJobMonitorControl
                {...{workspaceInfo, hitherJobs, websocketStatus}}
            />
        </Fragment>
    )
}
//////////////////////////////////////////////////////////////

const SetWorkspaceInfo: FunctionComponent<{workspaceName: string | null, feedUri: string | null, onSetWorkspaceInfo: (di: WorkspaceInfo) => void}> = ({ workspaceName, feedUri, onSetWorkspaceInfo }) => {
    useEffect(() => {
        (async () => {
            console.info(`Using feed: ${feedUri}`);
            const readOnly = ((feedUri) && (feedUri.startsWith('sha1://'))) ? true : false;
            onSetWorkspaceInfo({
                workspaceName,
                feedUri,
                readOnly
            });
        })();
    })
    return <div>Setting document info...</div>
}

// Thanks: https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs
function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}
//////////////////////////////////////////////////////////////////////////////////////////////////

interface StateProps {
    initialLoadComplete: boolean
    extensionsConfig: ExtensionsConfig
    workspaceInfo: WorkspaceInfo
    websocketStatus: string
}

interface DispatchProps {
    onSetWorkspaceInfo: (workspaceInfo: WorkspaceInfo) => void
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

const AppContainer: FunctionComponent<Props> = ({ initialLoadComplete, workspaceInfo, onSetWorkspaceInfo, extensionsConfig, websocketStatus }) => {
    const { workspaceName } = workspaceInfo;

    const { width, height } = useWindowDimensions()

    if (!workspaceName) {
        return (
            <Switch>
                <Route
                    path="/:workspaceName/:path*"
                    render={({ match, location }) => {
                        const query = QueryString.parse(location.search);
                        return <SetWorkspaceInfo
                            workspaceName={match.params.workspaceName}
                            feedUri={(query.feed as string) || null}
                            onSetWorkspaceInfo={onSetWorkspaceInfo}
                        />
                    }}
                />
                <Route path="/"><Redirect to="/default" /></Route>
            </Switch>
        )
        
    }

    const appBarHeight = 48 // hard-coded for now - must agree with theme.ts
    const H = height - appBarHeight - 2
    const hMargin = 0
    const W = width - hMargin * 2 - 2

    return (
        <div className={"TheAppBar"}>
            <AppBar position="static" style={{height: appBarHeight}}>
                <Toolbar>
                    <ToolBarContent workspaceInfo={workspaceInfo} extensionsConfig={extensionsConfig} websocketStatus={websocketStatus} />
                </Toolbar>
            </AppBar>
            <div className={"AppContent"} style={{padding: 0, position: 'absolute', top: appBarHeight, height: H, left: hMargin, width: W, overflowY: 'auto', overflowX: 'hidden'}}>
                {
                    initialLoadComplete ? (
                        <Routes width={W} height={H} />
                    ) : (
                        <div>Loading...</div>
                    )
                }
            </div>
        </div>
    )
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    initialLoadComplete: state.serverConnection.initialLoadComplete,
    workspaceInfo: state.workspaceInfo,
    extensionsConfig: state.extensionsConfig,
    websocketStatus: state.serverConnection.websocketStatus
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    onSetWorkspaceInfo: workspaceInfo => dispatch(setWorkspaceInfo(workspaceInfo))
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(sizeMe()(AppContainer)))