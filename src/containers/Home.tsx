import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { deleteRecordings, deleteSortingsForRecordings } from '../actions';
import { WorkspaceInfo } from '../AppContainer';
import { filterPlugins, Plugins } from '../extensions/extensionInterface';
import { RootAction, RootState } from '../reducers';
import { Recording } from '../reducers/recordings';
import { Sorting } from '../reducers/sortings';
import './Home.css';
import WorkspaceView from './WorkspaceView';

interface StateProps {
  sortings: Sorting[]
  recordings: Recording[]
  plugins: Plugins
}

interface DispatchProps {
  onDeleteRecordings: (recordingIds: string[]) => void
}

interface OwnProps {
  workspaceInfo: WorkspaceInfo
  width?: number
  height?: number
}

type Props = StateProps & DispatchProps & OwnProps

const Home: FunctionComponent<Props> = ({ workspaceInfo, width, height, sortings, recordings, onDeleteRecordings, plugins }) => {
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
          {...{workspaceInfo, sortings, recordings, onDeleteRecordings, plugins}}
        />
      </div>
    </div>
  );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
  sortings: state.sortings,
  recordings: state.recordings,
  plugins: filterPlugins(state.plugins)
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
  onDeleteRecordings: (recordingIds: string[]) => {
    dispatch(deleteSortingsForRecordings(recordingIds));
    dispatch(deleteRecordings(recordingIds));
  }
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(Home)