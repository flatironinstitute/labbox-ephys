import React, { FunctionComponent } from 'react';
import { WorkspaceDispatch, WorkspaceState } from './python/labbox_ephys/extensions/pluginInterface/workspaceReducer';


const Routes: FunctionComponent<{width: number, height: number, workspaceInfo: any, workspace: WorkspaceState, workspaceDispatch: WorkspaceDispatch}> = ({width, height, workspaceInfo, workspace, workspaceDispatch}) => {
    return <div>Routes</div>
    // const location = useLocation()
    // const pathList = location.pathname.split('/')
    // const { page, workspaceName} = (
    //     (['docs', 'about'].includes(pathList[1])) ? ({
    //         workspaceName: 'default',
    //         page: pathList[1]
    //     }) : ({
    //         workspaceName: pathList[1] || 'default',
    //         page: pathList[2] || ''
    //     })
    // )
    // if (workspaceName !== workspaceInfo.workspaceName) throw Error('Unexpected mismatch in workspaceName')

    // switch(page) {
    //     case 'about': return <About />
    //     case 'docs': return <Docs />
    //     case 'config': return <Config workspaceInfo={workspaceInfo} />
    //     case 'hitherJobMonitor': return <HitherJobMonitor />
    //     default: return <Home width={width} height={height} workspaceInfo={workspaceInfo} workspace={workspace} workspaceDispatch={workspaceDispatch} />
    // }
}

export default Routes;