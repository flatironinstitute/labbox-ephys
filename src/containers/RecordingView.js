import React from 'react'
import { connect } from 'react-redux'
import RecordingInfoView from '../components/RecordingInfoView';
import { Grid } from '@material-ui/core';
import { withRouter, Link } from 'react-router-dom';
import SortingsView from '../components/SortingsView';

const RecordingView = ({ recordingId, recording, sortings, sortingJobs, history }) => {
  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }

  const handleImportSortings = () => {
    history.push(`/importSortingsForRecording/${recordingId}`)
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <div>{recording.recordingPath}</div>
          <RecordingInfoView recordingInfo={recording.recordingInfo} />
          <Link to={`/timeseriesForRecording/${recordingId}`}>View timeseries</Link>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Link to={`/runSpikeSortingForRecording/${recordingId}`}>Run spike sorting</Link>
          <SortingsView sortings={sortings} sortingJobs={sortingJobs} onImportSortings={handleImportSortings} />
        </Grid>
      </Grid>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => ({
  // todo: use selector
  recording: state.recordings.filter(rec => (rec.recordingId === ownProps.recordingId))[0],
  sortings: state.sortings.filter(s => (s.recordingId === ownProps.recordingId)),
  sortingJobs: state.sortingJobs.filter(s => (s.recordingId === ownProps.recordingId))
})

const mapDispatchToProps = dispatch => ({
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(RecordingView))
