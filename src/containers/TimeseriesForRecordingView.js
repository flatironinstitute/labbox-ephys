import React from 'react'
import { connect } from 'react-redux'
import RecordingInfoView from '../components/RecordingInfoView';
import { withRouter } from 'react-router-dom';
import TimeseriesView from '../components/TimeseriesView'

const TimeseriesForRecordingView = ({ recordingId, recording }) => {
  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }

  return (
    <div>
      <RecordingInfoView recordingInfo={recording.recordingInfo} />
      <TimeseriesView recordingPath={recording.recordingPath} />
    </div>
  )
}

const mapStateToProps = (state, ownProps) => ({
  recording: state.recordings.filter(rec => (rec.recordingId === ownProps.recordingId))[0]
})

const mapDispatchToProps = dispatch => ({
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeseriesForRecordingView))
