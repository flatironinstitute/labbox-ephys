import { Modal } from '@material-ui/core';
import { useSubfeed } from 'labbox';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { MainWindowProps, useWorkspaceViewPlugins } from '../../pluginInterface';
import { parseWorkspaceUri } from '../../pluginInterface/misc';
import workspaceReducer, { WorkspaceAction } from '../../pluginInterface/workspaceReducer';
import ApplicationBar from './ApplicationBar';
import SettingsWindow from './SettingsWindow';

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

const MainWindow: FunctionComponent<MainWindowProps> = ({ workspaceUri, workspaceRoute, workspaceRouteDispatch, version }) => {
    const { width, height } = useWindowDimensions()
    const appBarHeight = 52 // hard-coded for now - must agree with theme
    const H = height - appBarHeight - 2
    const hMargin = 0
    const W = width - hMargin * 2 - 2

    const workspaceViewPlugin = useWorkspaceViewPlugins().filter(p => (p.name === 'WorkspaceView'))[0]
    if (!workspaceViewPlugin) throw Error('Unable to find workspace view plugin')

    const [settingsVisible, setSettingsVisible] = useState(false)

    const [workspace, workspaceDispatch2] = useReducer(workspaceReducer, useMemo(() => ({recordings: [], sortings: []}), []))
    const handleWorkspaceSubfeedMessages = useCallback((messages: any[]) => {
        messages.filter(msg => msg.action).forEach(msg => workspaceDispatch2(msg.action))
    }, [])

    const {feedUri, workspaceName} = parseWorkspaceUri(workspaceUri)

    const subfeedName = useMemo(() => ({workspaceName}), [workspaceName])

    const {appendMessages: appendWorkspaceMessages} = useSubfeed({feedUri, subfeedName, onMessages: handleWorkspaceSubfeedMessages })
    const workspaceDispatch = useCallback((a: WorkspaceAction) => {
        appendWorkspaceMessages([{action: a}])
    }, [appendWorkspaceMessages])

    const handleOpenSettings = useCallback(() => {
        setSettingsVisible(true)
    }, [])

    const handleCloseSettings = useCallback(() => {
        setSettingsVisible(false)
    }, [])

    return (
        <div style={{margin: 0}}>
            <ApplicationBar
                onOpenSettings={handleOpenSettings}
                workspaceRouteDispatch={workspaceRouteDispatch}
            />
            <div style={{position: 'absolute', top: appBarHeight}}>
                <workspaceViewPlugin.component width={W} height={H} workspace={workspace} workspaceDispatch={workspaceDispatch} workspaceRoute={workspaceRoute} workspaceRouteDispatch={workspaceRouteDispatch} />
            </div>
            <Modal
                open={settingsVisible}
                onClose={handleCloseSettings}
                style={{zIndex: 9999}}
            >
                <span>
                    <SettingsWindow
                        workspace={workspace}
                        workspaceUri={workspaceUri}
                        version={version}
                    />
                </span>
            </Modal>
        </div>
    )
}

export default MainWindow