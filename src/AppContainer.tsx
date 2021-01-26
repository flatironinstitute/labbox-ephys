import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
// LABBOX-CUSTOM /////////////////////////////////////////////
import Typography from '@material-ui/core/Typography';
import { Home } from '@material-ui/icons';
import QueryString from 'querystring';
import React, { Dispatch, Fragment, FunctionComponent, useEffect, useState } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link, RouteComponentProps, useLocation, withRouter } from 'react-router-dom';
import sizeMe from 'react-sizeme';
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
import { setWorkspaceInfo } from './actions';
>>>>>>> import recordings view python scripts
=======
>>>>>>> workspace view and simplified state flow
import HitherJobMonitorControl from './components/HitherJobMonitor/HitherJobMonitorControl';
import PersistStateControl from './containers/PersistStateControl';
import { HitherJob } from './extensions/common/hither';
import { useOnce } from './extensions/common/hooks';
import { ExtensionsConfig } from './extensions/reducers';
import { getPathQuery } from './kachery';
import { RootAction, RootState } from './reducers';
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
import { WorkspaceInfo } from './reducers/workspaceInfo';
>>>>>>> import recordings view python scripts
=======
>>>>>>> workspace view and simplified state flow
import Routes from './Routes';

export interface WorkspaceInfo {
    workspaceName: string | null
    feedUri: string | null
    readOnly: boolean | null
}

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

<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
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

>>>>>>> import recordings view python scripts
=======
>>>>>>> workspace view and simplified state flow
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
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
    workspaceInfo: WorkspaceInfo
>>>>>>> import recordings view python scripts
=======
>>>>>>> workspace view and simplified state flow
    websocketStatus: string
}

interface DispatchProps {
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
    onSetWorkspaceInfo: (workspaceInfo: WorkspaceInfo) => void
>>>>>>> import recordings view python scripts
=======
>>>>>>> workspace view and simplified state flow
}

interface OwnProps {
    onSetWorkspaceInfo: (workspaceInfo: WorkspaceInfo) => void
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
const AppContainer: FunctionComponent<Props> = ({ onSetWorkspaceInfo, initialLoadComplete, extensionsConfig, websocketStatus }) => {
    const { width, height } = useWindowDimensions()

    const location = useLocation()
    const pathList = location.pathname.split('/')
    const { workspaceName}: {page?: string, workspaceName?: string} = (
        (['docs', 'about'].includes(pathList[1])) ? ({
            workspaceName: 'default',
            page: pathList[1]
        }) : ({
            workspaceName: pathList[1] || 'default',
            page: pathList[2] || ''
        })
    )
    const query = QueryString.parse(location.search);
    const feedUri = (query.feed as string) || null
    const readOnly = ((feedUri) && (feedUri.startsWith('sha1://'))) ? true : false;
    const workspaceInfo: WorkspaceInfo = {
        workspaceName,
        feedUri,
        readOnly
=======
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
        
>>>>>>> import recordings view python scripts
=======
const AppContainer: FunctionComponent<Props> = ({ onSetWorkspaceInfo, initialLoadComplete, extensionsConfig, websocketStatus }) => {
    const { width, height } = useWindowDimensions()

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
    const query = QueryString.parse(location.search);
    const feedUri = (query.feed as string) || null
    const readOnly = ((feedUri) && (feedUri.startsWith('sha1://'))) ? true : false;
    const workspaceInfo: WorkspaceInfo = {
        workspaceName,
        feedUri,
        readOnly
>>>>>>> workspace view and simplified state flow
    }

    const appBarHeight = 48 // hard-coded for now - must agree with theme.ts
    const H = height - appBarHeight - 2
    const hMargin = 0
    const W = width - hMargin * 2 - 2
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b

    useOnce(() => {
        onSetWorkspaceInfo(workspaceInfo)
    })
=======
>>>>>>> import recordings view python scripts

    useOnce(() => {
        onSetWorkspaceInfo(workspaceInfo)
    })

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
                        <Routes width={W} height={H} workspaceInfo={workspaceInfo} />
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
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
    workspaceInfo: state.workspaceInfo,
>>>>>>> import recordings view python scripts
=======
>>>>>>> workspace view and simplified state flow
    extensionsConfig: state.extensionsConfig,
    websocketStatus: state.serverConnection.websocketStatus
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
    onSetWorkspaceInfo: workspaceInfo => dispatch(setWorkspaceInfo(workspaceInfo))
>>>>>>> import recordings view python scripts
=======
>>>>>>> workspace view and simplified state flow
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(sizeMe()(AppContainer)))