import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { deleteRecordings, deleteSortings, deleteSortingsForRecordings } from '../actions';
import { filterPlugins, Plugins } from '../extensions/extensionInterface';
import WorkspaceView, { WorkspaceInfo } from '../extensions/WorkspaceView';
import { RootAction, RootState } from '../reducers';
import { Recording } from '../reducers/recordings';
import { ServerInfo } from '../reducers/serverInfo';
import { Sorting } from '../reducers/sortings';
import './Home.css';

interface StateProps {
  sortings: Sorting[]
  recordings: Recording[]
  plugins: Plugins
  serverInfo: ServerInfo
}

interface DispatchProps {
  onDeleteRecordings: (recordingIds: string[]) => void
  onDeleteSortings: (sortingIds: string[]) => void
}

interface OwnProps {
  workspaceInfo: WorkspaceInfo
  width?: number
  height?: number
}

type Props = StateProps & DispatchProps & OwnProps

const Home: FunctionComponent<Props> = ({ workspaceInfo, serverInfo, width, height, sortings, recordings, onDeleteRecordings, onDeleteSortings, plugins }) => {
  const hMargin = 30
  const vMargin = 20
  const W = (width || 600) - hMargin * 2
  const H = (height || 600) - vMargin * 2
  const headerHeight = 0 // no header for now
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
          {...{workspaceInfo, sortings, recordings, onDeleteRecordings, onDeleteSortings, plugins}}
        />
      </div>
    </div>
  );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
  sortings: state.sortings,
  recordings: state.recordings,
  plugins: filterPlugins(state.plugins),
  serverInfo: state.serverInfo
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
  onDeleteRecordings: (recordingIds: string[]) => {
    dispatch(deleteSortingsForRecordings(recordingIds));
    dispatch(deleteRecordings(recordingIds));
  },
  onDeleteSortings: (sortingIds: string[]) => {
    dispatch(deleteSortings(sortingIds));
  }
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(Home)