import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { useSubfeed } from 'labbox';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import workspaceReducer, { WorkspaceAction } from './python/labbox_ephys/extensions/pluginInterface/workspaceReducer';
import Routes from './Routes';

type ToolBarContentProps = {
    workspaceInfo: any
}

const ToolBarContent: FunctionComponent<ToolBarContentProps> = ({ workspaceInfo }) => {
    return <div>ToolBarContent</div>
    // const { workspaceName, feedUri } = workspaceInfo || {workspaceName: '', feedUri: ''};
    // const hitherJobs: HitherJob[] = []
    // return (
    //     <Fragment>
    //         <Button color="inherit" component={Link} to={`/${workspaceName}${getPathQuery({feedUri})}`}>
    //             <Home />&nbsp;
    //             <Typography variant="h6">
    //                 Labbox-ephys
    //             </Typography>
    //         </Button>
    //         <span style={{marginLeft: 'auto'}} />
    //         <Button color="inherit" component={Link} to="/docs" style={{marginLeft: 'auto'}}>Docs</Button>
    //         <Button color="inherit" component={Link} to={`/${workspaceName}/config${getPathQuery({feedUri})}`} >Config</Button>
    //         <Button color="inherit" component={Link} to="/about">About</Button>
    //         <ServerStatusControl />
    //         <HitherJobMonitorControl
    //             {...{workspaceInfo, hitherJobs}}
    //         />
    //     </Fragment>
    // )
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

type Props = {
    workspaceInfo: any
}

const AppContainer: FunctionComponent<Props> = ({ workspaceInfo }) => {
    const { width, height } = useWindowDimensions()

    const appBarHeight = 48 // hard-coded for now - must agree with theme.ts
    const H = height - appBarHeight - 2
    const hMargin = 0
    const W = width - hMargin * 2 - 2

    const handleWorkspaceSubfeedMessages = useCallback((messages: any[]) => {
        messages.forEach(msg => {
            if (msg.action) {
                workspaceDispatch2(msg.action)
            }
        })
    }, [])
    const subfeedName = useMemo(() => ({workspaceName: workspaceInfo?.workspaceName || ''}), [workspaceInfo?.workspaceName])
    const {appendMessages: appendWorkspaceMessages, loadedInitialMessages: initialLoadComplete} = useSubfeed({feedUri: workspaceInfo.feedUri, subfeedName, onMessages: handleWorkspaceSubfeedMessages})
    const [workspace, workspaceDispatch2] = useReducer(workspaceReducer, {recordings: [], sortings: []})
    // const workspaceSubfeed = useAppendOnlyLog({feedUri: '', subfeedName})
    const workspaceDispatch = useCallback((a: WorkspaceAction) => {
        appendWorkspaceMessages([{action: a}])
    }, [appendWorkspaceMessages])

    // // We need to wrap the workspaceSubfeed in workspaceSubfeedForReducer because the messages in the subfeed are of the form {action: x}, whereas the reducer just takes the actions (ie x)
    // const workspaceSubfeedForReducer = useMemo((): AppendOnlyLog | null => {
    //     return workspaceSubfeed ? {
    //         appendMessages: (msgs: any[]) => {
    //             workspaceSubfeed.appendMessages(msgs.map(msg => ({action: msg})))
    //         },
    //         allMessages: () => (workspaceSubfeed.allMessages().map(m => (m.action || {}))),
    //         onMessages: (callback: (position: number, msgs: any[]) => void) => {
    //             workspaceSubfeed.onMessages((pos2: number, msgs2: any[]) => {
    //                 callback(pos2, msgs2.map(m => (m.action || {})))
    //             })
    //         }
    //     } : null
    // }, [workspaceSubfeed])

    // const [workspace, workspaceDispatch] = useFeedReducer<WorkspaceState, WorkspaceAction>(
    //     workspaceReducer,
    //     {recordings: [], sortings: []},
    //     workspaceSubfeedForReducer
    // )

    // const {initialLoadComplete} = useContext(LabboxProviderContext)

    return (
        <div className={"TheAppBar"}>
            <AppBar position="static" style={{height: appBarHeight}}>
                <Toolbar>
                    <ToolBarContent workspaceInfo={workspaceInfo || {workspaceName: '', feedUri: '', readOnly: true}} />
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