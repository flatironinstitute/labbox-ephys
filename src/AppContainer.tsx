import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
// LABBOX-CUSTOM /////////////////////////////////////////////
import Typography from '@material-ui/core/Typography';
import { Home } from '@material-ui/icons';
import React, { Fragment, FunctionComponent, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HitherJobMonitorControl from './components/HitherJobMonitor/HitherJobMonitorControl';
import ServerStatusControl from './containers/ServerStatusControl';
import { AppendOnlyLog, useFeedReducer } from './extensions/common/useFeedReducer';
import { WorkspaceInfo } from './extensions/labbox';
import { HitherJob } from './extensions/labbox/hither';
import { LabboxProviderContext } from './extensions/labbox/LabboxProvider';
import workspaceReducer, { WorkspaceAction, WorkspaceState } from './extensions/pluginInterface/workspaceReducer';
import { getPathQuery } from './kachery';
import Routes from './Routes';

type ToolBarContentProps = {
    workspaceInfo: WorkspaceInfo | null
}

const ToolBarContent: FunctionComponent<ToolBarContentProps> = ({ workspaceInfo }) => {
    const { workspaceName, feedUri } = workspaceInfo || {workspaceName: '', feedUri: ''};
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
            <ServerStatusControl />
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

type Props = {}

const AppContainer: FunctionComponent<Props> = () => {
    const { width, height } = useWindowDimensions()
    const {workspaceSubfeed, workspaceInfo} = useContext(LabboxProviderContext)

    const appBarHeight = 48 // hard-coded for now - must agree with theme.ts
    const H = height - appBarHeight - 2
    const hMargin = 0
    const W = width - hMargin * 2 - 2

    // We need to wrap the workspaceSubfeed in workspaceSubfeedForReducer because the messages in the subfeed are of the form {action: x}, whereas the reducer just takes the actions (ie x)
    const workspaceSubfeedForReducer = useMemo((): AppendOnlyLog | null => {
        return workspaceSubfeed ? {
            appendMessage: (msg: any) => {
                workspaceSubfeed.appendMessage({action: msg})
            },
            allMessages: () => (workspaceSubfeed.allMessages().map(m => (m.action || {}))),
            onMessage: (callback: (msg: any) => void) => {
                workspaceSubfeed.onMessage((m: any) => {
                    callback(m.action || {})
                })
            }
        } : null
    }, [workspaceSubfeed])

    const [workspace, workspaceDispatch] = useFeedReducer<WorkspaceState, WorkspaceAction>(
        workspaceReducer,
        {recordings: [], sortings: []},
        workspaceSubfeedForReducer
    )

    const {initialLoadComplete} = useContext(LabboxProviderContext)

    return (
        <div className={"TheAppBar"}>
            <AppBar position="static" style={{height: appBarHeight}}>
                <Toolbar>
                    <ToolBarContent workspaceInfo={workspaceInfo} />
                </Toolbar>
            </AppBar>
            <div className={"AppContent"} style={{padding: 0, position: 'absolute', top: appBarHeight, height: H, left: hMargin, width: W, overflowY: 'auto', overflowX: 'hidden'}}>
                {
                    (initialLoadComplete) && (workspaceInfo) ? (
                        <Routes width={W} height={H} workspaceInfo={workspaceInfo} workspace={workspace} workspaceDispatch={workspaceDispatch} />
                    ) : (
                        <div>Loading...</div>
                    )
                }
            </div>
        </div>
    )
}

export default AppContainer