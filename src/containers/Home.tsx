import React, { FunctionComponent } from 'react';
import { WorkspaceInfo } from '../python/labbox_ephys/extensions/pluginInterface';
import { WorkspaceDispatch, WorkspaceState } from '../python/labbox_ephys/extensions/pluginInterface/workspaceReducer';
import './Home.css';

type Props = {
  workspaceInfo: WorkspaceInfo
  workspace: WorkspaceState
  workspaceDispatch: WorkspaceDispatch
  width?: number
  height?: number
}

const Home: FunctionComponent<Props> = ({ workspaceInfo, width, height, workspace, workspaceDispatch }) => {
  return <div>Home</div>
  // const plugins = useLabboxPlugins<LabboxPlugin>()
  // const hMargin = 30
  // const vMargin = 20
  // const W = (width || 600) - hMargin * 2
  // const H = (height || 600) - vMargin * 2
  // const headerHeight = 0 // no header for now

  // const history = useHistory()
  // const location = useLocation()

  // const { serverInfo } = useContext(LabboxProviderContext)

  // const [workspaceRoute, workspaceRouteDispatch] = useWorkspaceRoute(location, history, workspaceInfo)

  // return (
  //   <div style={{ marginLeft: hMargin, marginRight: hMargin, marginTop: vMargin, marginBottom: vMargin }}>
  //     {/* {
  //       readOnly && (
  //         <Typography component="p" style={{fontStyle: "italic"}}>
  //           VIEW ONLY
  //         </Typography>
  //       )
  //     }
  //     <Typography component="p">
  //       Analysis and visualization of neurophysiology recordings and spike sorting results.
  //     </Typography> */}
  //     <div
  //       style={{ position: 'absolute', top: headerHeight + vMargin, width: W, height: H - headerHeight }}
  //     >
  //       <WorkspaceView
  //         width={W}
  //         height={H - headerHeight}
  //         defaultFeedId={serverInfo?.defaultFeedId || ''}
  //         workspaceRoute={workspaceRoute}
  //         workspaceRouteDispatch={workspaceRouteDispatch}
  //         {...{ workspaceInfo, workspace, workspaceDispatch, plugins }}
  //       />
  //     </div>
  //   </div>
  // );
}

export default Home