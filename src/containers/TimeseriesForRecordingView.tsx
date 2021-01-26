import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import sizeMe, { SizeMeProps } from 'react-sizeme';
import { useRecordingInfo } from '../extensions/common/getRecordingInfo';
import TimeseriesViewNew from '../extensions/timeseries/TimeseriesViewNew/TimeseriesViewNew';
import { RootAction, RootState } from '../reducers';
import { Recording } from '../reducers/recordings';

interface StateProps {
  recording: Recording
}

interface DispatchProps {
}

interface OwnProps {
  recordingId: string
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps & SizeMeProps

const TimeseriesForRecordingView: FunctionComponent<Props> = ({ recordingId, recording, size }) => {
  const recordingInfo = useRecordingInfo(recording?.recordingObject)
  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }
  if (!recordingInfo) {
    return <h3>{`Loading recording info`}</h3>
  }

  const width = size.width;
  const height = 650; // hard-coded for now

  if (!width) return <div>No width</div>

  return (
    <div>
      <h1>{recording.recordingLabel}</h1>
      <div>
        <TimeseriesViewNew
          recordingObject={recording.recordingObject}
          recordingInfo={recordingInfo}
          width={width}
          height={height}
          opts={{channelSelectPanel: true}}
        />
      </div>
    </div>
  )
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
  recording: state.recordings.filter(rec => (rec.recordingId === ownProps.recordingId))[0]
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default sizeMe()(withRouter(connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(TimeseriesForRecordingView)))