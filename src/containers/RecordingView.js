import React from 'react'
import { connect } from 'react-redux'
import RecordingInfoView from '../components/RecordingInfoView';
import { Grid } from '@material-ui/core';
import { withRouter, Link } from 'react-router-dom';
import SortingsView from '../components/SortingsView';
import { getPathQuery } from '../kachery';

const RecordingView = ({ recordingId, recording, sortings, sortingJobs, history, feedUri, documentId }) => {
  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }

  const handleImportSortings = () => {
    history.push(`/${documentId}/importSortingsForRecording/${recordingId}${getPathQuery({feedUri})}`)
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <h2>{recording.recordingLabel}</h2>
          <div>{recording.recordingPath}</div>
          <RecordingInfoView recordingInfo={recording.recordingInfo} />
          <Link to={`/${documentId}/timeseriesForRecording/${recordingId}${getPathQuery({feedUri})}`}>View timeseries</Link>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Link to={`/${documentId}/runSpikeSortingForRecording/${recordingId}${getPathQuery({feedUri})}`}>Run spike sorting</Link>
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
  sortingJobs: state.sortingJobs.filter(s => (s.recordingId === ownProps.recordingId)),
  documentId: state.documentInfo.documentId,
  feedUri: state.documentInfo.feedUri
})

const mapDispatchToProps = dispatch => ({
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(RecordingView))
