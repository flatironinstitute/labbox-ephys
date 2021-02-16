import React, { FunctionComponent } from 'react';
import { useLocation } from "react-router-dom";
import About from './components/About';
import Docs from './components/Docs';
import HitherJobMonitor from './components/HitherJobMonitor/HitherJobMonitor';
import Config from './containers/Config';
import Home from "./containers/Home";
import { WorkspaceInfo } from './extensions/labbox';
import { WorkspaceDispatch, WorkspaceState } from './extensions/pluginInterface/workspaceReducer';


const Routes: FunctionComponent<{width: number, height: number, workspaceInfo: WorkspaceInfo, workspace: WorkspaceState, workspaceDispatch: WorkspaceDispatch}> = ({width, height, workspaceInfo, workspace, workspaceDispatch}) => {
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

    switch(page) {
        case 'about': return <About />
        case 'docs': return <Docs />
        case 'config': return <Config />
        case 'hitherJobMonitor': return <HitherJobMonitor />
        default: return <Home width={width} height={height} workspaceInfo={workspaceInfo} workspace={workspace} workspaceDispatch={workspaceDispatch} />
    }
}

export default Routes;