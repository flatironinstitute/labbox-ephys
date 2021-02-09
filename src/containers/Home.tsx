import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { WorkspaceDispatch, WorkspaceState } from '../extensions/common/workspaceReducer';
import { filterPlugins, Plugins } from '../extensions/extensionInterface';
import WorkspaceView, { WorkspaceInfo } from '../extensions/WorkspaceView';
import { RootAction, RootState } from '../reducers';
import { ServerInfo } from '../reducers/serverInfo';
import './Home.css';

interface StateProps {
  plugins: Plugins
  serverInfo: ServerInfo
}

interface DispatchProps {
}

interface OwnProps {
  workspaceInfo: WorkspaceInfo
  workspace: WorkspaceState
  workspaceDispatch: WorkspaceDispatch
  width?: number
  height?: number
}

type Props = StateProps & DispatchProps & OwnProps

const Home: FunctionComponent<Props> = ({ workspaceInfo, serverInfo, width, height, workspace, workspaceDispatch, plugins }) => {
  const hMargin = 30
  const vMargin = 20
  const W = (width || 600) - hMargin * 2
  const H = (height || 600) - vMargin * 2
  const headerHeight = 0 // no header for now

  const history = useHistory()
  const location = useLocation()

  return (
    <div style={{marginLeft: hMargin, marginRight: hMargin, marginTop: vMargin, marginBottom: vMargin}}>
      {/* {
        readOnly && (
          <Typography component="p" style={{fontStyle: "italic"}}>
            VIEW ONLY
          </Typography>
        )
      }
      <Typography component="p">
        Analysis and visualization of neurophysiology recordings and spike sorting results.
      </Typography> */}
      <div
        style={{position: 'absolute', top: headerHeight + vMargin, width: W, height: H - headerHeight}}
      >
        <WorkspaceView
          width={W}
          height={H - headerHeight}
          defaultFeedId={serverInfo.defaultFeedId || ''}
          {...{workspaceInfo, workspace, workspaceDispatch, plugins, history, location}}
        />
      </div>
    </div>
  );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
  plugins: filterPlugins(state.plugins),
  serverInfo: state.serverInfo
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(Home)