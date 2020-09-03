
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import RecordingInfoView from '../RecordingInfoView';
import { Grid, Divider, Typography } from '@material-ui/core';
import { withRouter, Link } from 'react-router-dom';
import SortingsView from '../SortingsView';
import { getPathQuery } from '../../kachery';
import { getRecordingInfo } from '../../actions/getRecordingInfo';
import { setRecordingInfo } from '../../actions';
import RecordingHeader from './components/RecordingHeader'
import RecordingBody from './components/RecordingBody/RecordingBody';

const NewRecordingView = ({ recordingId, recording, sortings, sortingJobs, history, documentInfo, onSetRecordingInfo }) => {
    const { documentId, feedUri, readonly } = documentInfo;

    const renderDate = () => {
        const date = new Date()
        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }

    console.log('documentInfo', documentInfo)
    if (!recording) {
        return <h3>{`Recording not found: ${recordingId}`}</h3>
    }

    const handleImportSortings = () => {
        history.push(`/${documentId}/importSortingsForRecording/${recordingId}${getPathQuery({ feedUri })}`)
    }

    return (
        <div>
            <Grid container spacing={5}>
                <Grid item xs={12}>
                    <RecordingHeader recordingId={recordingId} recordingUpdateDate={renderDate()} />
                </Grid>
                <Grid item xs={12}>
                    <RecordingBody recording={recording} />
                </Grid>
            </Grid>
        </div>
    )
}

const mapStateToProps = (state, ownProps) => ({
    recording: state.recordings.filter(rec => (rec.recordingId === ownProps.recordingId))[0],
    sortings: state.sortings.filter(s => (s.recordingId === ownProps.recordingId)),
    sortingJobs: state.sortingJobs.filter(s => (s.recordingId === ownProps.recordingId)),
    documentInfo: state.documentInfo
})

const mapDispatchToProps = dispatch => ({
    onSetRecordingInfo: ({ recordingId, recordingInfo }) => dispatch(setRecordingInfo({ recordingId, recordingInfo }))
})

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(NewRecordingView))

/* <Grid item xs={12} lg={6}>
                    <h2>{recording.recordingLabel}</h2>
                    <div>{recording.recordingPath}</div>
                    <RecordingInfoView recordingInfo={recording.recordingInfo} />
                    <Link to={`/${documentId}/timeseriesForRecording/${recordingId}${getPathQuery({ feedUri })}`}>View timeseries</Link>
                </Grid>

                <Grid item xs={12} lg={6}>
                     <Link to={`/${documentId}/runSpikeSortingForRecording/${recordingId}${getPathQuery({feedUri})}`}>Run spike sorting</Link>
                    <SortingsView sortings={sortings} sortingJobs={sortingJobs} onImportSortings={readonly ? null : handleImportSortings} />
                </Grid>
*/