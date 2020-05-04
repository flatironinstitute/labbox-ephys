import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import TimeseriesView from '../components/TimeseriesView'
import { SizeMe } from 'react-sizeme';

const TimeseriesForRecordingView = ({ recordingId, recording }) => {
  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }

  return (
    <div>
      <h1>{recordingId}</h1>
      <SizeMe
        render={
          ({ size }) => {
            const width = size.width;
            const height = 650; // hard-coded for now
            return (
              <div>
                <TimeseriesView recordingPath={recording.recordingPath} width={width} height={height} />
              </div>
            );
          }
        }
      />
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
