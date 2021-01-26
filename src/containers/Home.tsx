<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
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
=======
import { Typography } from '@material-ui/core';
import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { deleteRecordings, setRecordingInfo } from '../actions';
import { RootAction, RootState } from '../reducers';
import { Recording, RecordingInfo } from '../reducers/recordings';
import { Sorting } from '../reducers/sortings';
import { WorkspaceInfo } from '../reducers/workspaceInfo';
import './Home.css';
import WorkspaceView from './WorkspaceView';

interface StateProps {
  workspaceInfo: WorkspaceInfo
<<<<<<< 13373a8a30be1f9ea678e7f96755fb69949fe6b4
>>>>>>> import recordings view python scripts
=======
  sortings: Sorting[]
  recordings: Recording[]
>>>>>>> add WorspaceView
}

interface DispatchProps {
  onDeleteRecordings: (recordingIds: string[]) => void
<<<<<<< 13373a8a30be1f9ea678e7f96755fb69949fe6b4
=======
  onSetRecordingInfo: (a: { recordingId: string, recordingInfo: RecordingInfo }) => void
>>>>>>> add WorspaceView
}

interface OwnProps {
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
  workspaceInfo: WorkspaceInfo
=======
>>>>>>> import recordings view python scripts
  width?: number
  height?: number
}

type Props = StateProps & DispatchProps & OwnProps

<<<<<<< 13373a8a30be1f9ea678e7f96755fb69949fe6b4
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
const Home: FunctionComponent<Props> = ({ workspaceInfo, width, height, sortings, recordings, onDeleteRecordings, plugins }) => {
=======
const Home: FunctionComponent<Props> = ({ workspaceInfo, width, height }) => {
=======
const Home: FunctionComponent<Props> = ({ workspaceInfo, width, height, sortings, recordings, onDeleteRecordings, onSetRecordingInfo }) => {
>>>>>>> add WorspaceView
  const { workspaceName, feedUri, readOnly } = workspaceInfo;
>>>>>>> import recordings view python scripts
  const hMargin = 30
  const vMargin = 20
  const W = (width || 600) - hMargin * 2
  const H = (height || 600) - vMargin * 2
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
  const headerHeight = 0 // no header for now
  return (
    <div style={{marginLeft: hMargin, marginRight: hMargin, marginTop: vMargin, marginBottom: vMargin}}>
      {/* {
=======
  console.log('height of home', H)
  return (
    <div style={{marginLeft: hMargin, marginRight: hMargin, marginTop: vMargin, marginBottom: vMargin}}>
      {
>>>>>>> import recordings view python scripts
        readOnly && (
          <Typography component="p" style={{fontStyle: "italic"}}>
            VIEW ONLY
          </Typography>
        )
      }
      <Typography component="p">
        Analysis and visualization of neurophysiology recordings and spike sorting results.
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
      </Typography> */}
      <div
        style={{position: 'absolute', top: headerHeight + vMargin, width: W, height: H - headerHeight}}
      >
        <WorkspaceView
          width={W}
          height={H - headerHeight}
          {...{workspaceInfo, sortings, recordings, onDeleteRecordings, plugins}}
=======
      </Typography>
      <div
        style={{position: 'absolute', top: 50 + vMargin, width: W, height: H - 50}}
      >
        <WorkspaceView
          width={W}
          height={H - 50}
<<<<<<< 13373a8a30be1f9ea678e7f96755fb69949fe6b4
>>>>>>> import recordings view python scripts
=======
          {...{workspaceInfo, sortings, recordings, onDeleteRecordings, onSetRecordingInfo}}
>>>>>>> add WorspaceView
        />
      </div>
    </div>
  );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
<<<<<<< 13373a8a30be1f9ea678e7f96755fb69949fe6b4
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
  sortings: state.sortings,
  recordings: state.recordings,
  plugins: filterPlugins(state.plugins)
=======
  workspaceInfo: state.workspaceInfo
>>>>>>> import recordings view python scripts
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
  onDeleteRecordings: (recordingIds: string[]) => {
    dispatch(deleteSortingsForRecordings(recordingIds));
    dispatch(deleteRecordings(recordingIds));
  }
=======
  workspaceInfo: state.workspaceInfo,
  sortings: state.sortings,
  recordings: state.recordings
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
  onDeleteRecordings: (recordingIds: string[]) => dispatch(deleteRecordings(recordingIds)),
  onSetRecordingInfo: (a: {recordingId: string, recordingInfo: RecordingInfo}) => dispatch(setRecordingInfo(a))
>>>>>>> add WorspaceView
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(Home)