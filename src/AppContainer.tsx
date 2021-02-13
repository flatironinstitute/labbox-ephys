import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
// LABBOX-CUSTOM /////////////////////////////////////////////
import Typography from '@material-ui/core/Typography';
import { Home } from '@material-ui/icons';
import QueryString from 'querystring';
import React, { Dispatch, Fragment, FunctionComponent, useEffect, useMemo, useState } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link, RouteComponentProps, useLocation, withRouter } from 'react-router-dom';
import sizeMe from 'react-sizeme';
import HitherJobMonitorControl from './components/HitherJobMonitor/HitherJobMonitorControl';
import ServerStatusControl from './containers/ServerStatusControl';
import { useOnce } from './extensions/common/hooks';
import { AppendOnlyLog, useFeedReducer } from './extensions/common/useFeedReducer';
import { HitherJob } from './extensions/labbox/hither';
import workspaceReducer, { WorkspaceAction, WorkspaceState } from './extensions/pluginInterface/workspaceReducer';
import { ExtensionsConfig } from './extensions/reducers';
import { WorkspaceInfo } from './extensions/WorkspaceView';
import { getPathQuery } from './kachery';
import { RootAction, RootState } from './reducers';
import Routes from './Routes';

type ToolBarContentProps = {
    workspaceInfo: WorkspaceInfo
    extensionsConfig: ExtensionsConfig
    websocketStatus: string
    onReconnect: () => void
}

const ToolBarContent: FunctionComponent<ToolBarContentProps> = ({ workspaceInfo, extensionsConfig, websocketStatus, onReconnect }) => {
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
            <ServerStatusControl onReconnect={onReconnect} />
            <HitherJobMonitorControl
                {...{workspaceInfo, hitherJobs}}
            />
        </Fragment>
    )
}
//////////////////////////////////////////////////////////////

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
    websocketStatus: string
}

interface DispatchProps {
}

interface OwnProps {
    onSetWorkspaceInfo: (workspaceInfo: WorkspaceInfo) => void
    onReconnect: () => void
    workspaceSubfeed: AppendOnlyLog
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

const AppContainer: FunctionComponent<Props> = ({ onSetWorkspaceInfo, onReconnect, initialLoadComplete, extensionsConfig, websocketStatus, workspaceSubfeed }) => {
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
    const query = QueryString.parse(location.search.slice(1));
    const feedUri = (query.feed as string) || null
    const readOnly = ((feedUri) && (feedUri.startsWith('sha1://'))) ? true : false;
    const workspaceInfo: WorkspaceInfo = {
        workspaceName,
        feedUri,
        readOnly
    }

    const appBarHeight = 48 // hard-coded for now - must agree with theme.ts
    const H = height - appBarHeight - 2
    const hMargin = 0
    const W = width - hMargin * 2 - 2

    useOnce(() => {
        onSetWorkspaceInfo(workspaceInfo)
    })

    // We need to wrap the workspaceSubfeed in workspaceSubfeedForReducer because the messages in the subfeed are of the form {action: x}, whereas the reducer just takes the actions (ie x)
    const workspaceSubfeedForReducer = useMemo((): AppendOnlyLog => {
        return {
            appendMessage: (msg: any) => {
                workspaceSubfeed.appendMessage({action: msg})
            },
            allMessages: () => (workspaceSubfeed.allMessages().map(m => (m.action || {}))),
            onMessage: (callback: (msg: any) => void) => {
                workspaceSubfeed.onMessage((m: any) => {
                    callback(m.action || {})
                })
            }
        }
    }, [workspaceSubfeed])

    const [workspace, workspaceDispatch] = useFeedReducer<WorkspaceState, WorkspaceAction>(
        workspaceReducer,
        {recordings: [], sortings: []},
        workspaceSubfeedForReducer
    )

    return (
        <div className={"TheAppBar"}>
            <AppBar position="static" style={{height: appBarHeight}}>
                <Toolbar>
                    <ToolBarContent onReconnect={onReconnect} workspaceInfo={workspaceInfo} extensionsConfig={extensionsConfig} websocketStatus={websocketStatus} />
                </Toolbar>
            </AppBar>
            <div className={"AppContent"} style={{padding: 0, position: 'absolute', top: appBarHeight, height: H, left: hMargin, width: W, overflowY: 'auto', overflowX: 'hidden'}}>
                {
                    initialLoadComplete ? (
                        <Routes width={W} height={H} workspaceInfo={workspaceInfo} workspace={workspace} workspaceDispatch={workspaceDispatch} />
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
    extensionsConfig: state.extensionsConfig,
    websocketStatus: state.serverConnection.websocketStatus
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(sizeMe()(AppContainer)))