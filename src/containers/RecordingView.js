import React from 'react'
import { connect } from 'react-redux'
import RecordingInfoView from '../components/RecordingInfoView';

const RecordingView = ({ recordingId, recordings }) => {
  const recording = recordings.filter(rec => (rec.recordingId === recordingId))[0];
  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }
  console.log('---', recording);

  return (
    <div>
      <h1>{recordingId}</h1>
      <p>{recording.recordingPath}</p>
      <RecordingInfoView recordingInfo={recording.recordingInfo} />
    </div>
  )
}

const mapStateToProps = state => ({
  recordings: state.recordings
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecordingView)
