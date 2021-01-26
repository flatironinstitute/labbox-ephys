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
  sortings: Sorting[]
  recordings: Recording[]
}

interface DispatchProps {
  onDeleteRecordings: (recordingIds: string[]) => void
  onSetRecordingInfo: (a: { recordingId: string, recordingInfo: RecordingInfo }) => void
}

interface OwnProps {
  width?: number
  height?: number
}

type Props = StateProps & DispatchProps & OwnProps

const Home: FunctionComponent<Props> = ({ workspaceInfo, width, height, sortings, recordings, onDeleteRecordings, onSetRecordingInfo }) => {
  const { workspaceName, feedUri, readOnly } = workspaceInfo;
  const hMargin = 30
  const vMargin = 20
  const W = (width || 600) - hMargin * 2
  const H = (height || 600) - vMargin * 2
  console.log('height of home', H)
  return (
    <div style={{marginLeft: hMargin, marginRight: hMargin, marginTop: vMargin, marginBottom: vMargin}}>
      {
        readOnly && (
          <Typography component="p" style={{fontStyle: "italic"}}>
            VIEW ONLY
          </Typography>
        )
      }
      <Typography component="p">
        Analysis and visualization of neurophysiology recordings and spike sorting results.
      </Typography>
      <div
        style={{position: 'absolute', top: 50 + vMargin, width: W, height: H - 50}}
      >
        <WorkspaceView
          width={W}
          height={H - 50}
          {...{workspaceInfo, sortings, recordings, onDeleteRecordings, onSetRecordingInfo}}
        />
      </div>
    </div>
  );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
  workspaceInfo: state.workspaceInfo,
  sortings: state.sortings,
  recordings: state.recordings
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
  onDeleteRecordings: (recordingIds: string[]) => dispatch(deleteRecordings(recordingIds)),
  onSetRecordingInfo: (a: {recordingId: string, recordingInfo: RecordingInfo}) => dispatch(setRecordingInfo(a))
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(Home)