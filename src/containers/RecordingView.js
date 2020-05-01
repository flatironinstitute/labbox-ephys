import React from 'react'
import { connect } from 'react-redux'
import RecordingInfoView from '../components/RecordingInfoView';
import { Button, Paper, Grid } from '@material-ui/core';
import SortingsTable from './SortingsTable';
import { withRouter } from 'react-router-dom';

const RecordingView = ({ recordingId, recordings, sortings, history }) => {
  const recording = recordings.filter(rec => (rec.recordingId === recordingId))[0];
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
          <RecordingInfoView recordingInfo={recording.recordingInfo} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <SortingsView recordingId={recordingId} sortings={sortings} onImportSortings={handleImportSortings} />
        </Grid>
      </Grid>
    </div>
  )
}

const SortingsView = ({ sortings, recordingId, onImportSortings }) => {
  const sortingsFilt = sortings.filter(s => (s.recordingId === recordingId));
  return (
    <Paper>
      <h3>{`${sortingsFilt.length} sortings`}</h3>
      <Button onClick={onImportSortings}>Import sortings</Button>
      <SortingsTable recordingId={recordingId} />  
    </Paper>
  );
}

const mapStateToProps = state => ({
  recordings: state.recordings,
  sortings: state.sortings
})

const mapDispatchToProps = dispatch => ({
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(RecordingView))
