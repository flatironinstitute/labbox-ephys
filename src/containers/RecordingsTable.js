import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import NiceTable from '../components/NiceTable'
import { deleteRecordings, setRecordingInfo, sleep } from '../actions';
import { createHitherJob } from '../hither';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import { getPathQuery } from '../kachery';
import { getRecordingInfo } from '../actions/getRecordingInfo';

const RecordingsTable = ({ recordings, onDeleteRecordings, onSetRecordingInfo, documentInfo }) => {
    const { documentId, feedUri, readonly } = documentInfo;

    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    recordings = sortByKey(recordings, 'recordingLabel');

    const effect = async () => {
        recordings.forEach(rec => {
            (async () => {
                if ((!rec.recordingInfo) && (!rec.fetchingRecordingInfo)) {
                    // todo: use calculationPool for this
                    rec.fetchingRecordingInfo = true;
                    try {
                        const info = await getRecordingInfo({recordingObject: rec.recordingObject});
                        onSetRecordingInfo({ recordingId: rec.recordingId, recordingInfo: info });
                    }
                    catch (err) {
                        console.error(err);
                        return;
                    }
                }
            })();
        });
    }
    useEffect(() => { effect() })

    const rows = recordings.map(rec => ({
        recording: rec,
        key: rec.recordingId,
        recordingLabel: {
            text: rec.recordingLabel,
            element: <Link title={"View this recording"} to={`/${documentId}/recording/${rec.recordingId}${getPathQuery({feedUri})}`}>{rec.recordingLabel}</Link>,
        },
        numChannels: rec.recordingInfo ? rec.recordingInfo.channel_ids.length : {element: <CircularProgress />},
        samplingFrequency: rec.recordingInfo ? rec.recordingInfo.sampling_frequency : '',
        durationMinutes: rec.recordingInfo ? rec.recordingInfo.num_frames / rec.recordingInfo.sampling_frequency / 60 : ''
    }));

    const columns = [
        {
            key: 'recordingLabel',
            label: 'Recording'
        },
        {
            key: 'numChannels',
            label: 'Num. channels'
        },
        {
            key: 'samplingFrequency',
            label: 'Samp. freq. (Hz)'
        },
        {
            key: 'durationMinutes',
            label: 'Duration (min)'
        }
    ]

    return (
        <div>
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this recording"}
                onDeleteRow={readonly ? null : (row) => onDeleteRecordings([row.recording.recordingId])}
            />
        </div>
    );
}

const mapStateToProps = state => ({
    recordings: state.recordings,
    documentInfo: state.documentInfo
})

const mapDispatchToProps = dispatch => ({
    onDeleteRecordings: recordingIds => dispatch(deleteRecordings(recordingIds)),
    onSetRecordingInfo: ({ recordingId, recordingInfo }) => dispatch(setRecordingInfo({ recordingId, recordingInfo }))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RecordingsTable)
