import { Grid } from '@material-ui/core';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { setRecordingInfo } from '../actions';
import { getRecordingInfo } from '../actions/getRecordingInfo';
import RecordingInfoView from '../components/RecordingInfoView';
import SortingsView from '../components/SortingsView';
import { getPathQuery } from '../kachery';
import { sortByPriority } from '../reducers/extensionContext';
import { Expandable } from './SortingView';

const RecordingView = ({ recordingId, recording, sortings, history, documentInfo, onSetRecordingInfo, recordingViews }) => {
  const { documentId, feedUri, readOnly } = documentInfo;

  const effect = async () => {
    if (!recording) return;
    const rec = recording;
    if (!rec.recordingInfo) {
      try {
        const info = await getRecordingInfo({ recordingObject: rec.recordingObject });
        onSetRecordingInfo({ recordingId: rec.recordingId, recordingInfo: info });
      }
      catch (err) {
        console.error(err);
        return;
      }
    }
  }
  useEffect(() => { effect() })

  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }

  const handleImportSortings = () => {
    history.push(`/${documentId}/importSortingsForRecording/${recordingId}${getPathQuery({ feedUri })}`)
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <h2>{recording.recordingLabel}</h2>
          <div>{recording.recordingPath}</div>
          <RecordingInfoView recordingInfo={recording.recordingInfo} hideElectrodeGeometry={true} />
        </Grid>

        <Grid item xs={12} lg={6}>
          {/* <Link to={`/${documentId}/runSpikeSortingForRecording/${recordingId}${getPathQuery({feedUri})}`}>Run spike sorting</Link> */}
          <SortingsView sortings={sortings} onImportSortings={readOnly ? null : handleImportSortings} />
        </Grid>
      </Grid>
      {
          sortByPriority(recordingViews).map(rv => (
            <Expandable label={rv.label} defaultExpanded={rv.defaultExpanded ? true : false}>
              <rv.component
                recording={recording}
              />
            </Expandable>
          ))
      }
      <div style={{padding: 20}}>
        <Link to={`/${documentId}/timeseriesForRecording/${recordingId}${getPathQuery({ feedUri })}`}>View timeseries in new page</Link>
      </div>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => ({
  // todo: use selector
  recordingViews: state.extensionContext.recordingViews,
  recording: state.recordings.filter(rec => (rec.recordingId === ownProps.recordingId))[0],
  sortings: state.sortings.filter(s => (s.recordingId === ownProps.recordingId)),
  documentInfo: state.documentInfo
})

const mapDispatchToProps = dispatch => ({
  onSetRecordingInfo: ({ recordingId, recordingInfo }) => dispatch(setRecordingInfo({ recordingId, recordingInfo }))
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(RecordingView))
