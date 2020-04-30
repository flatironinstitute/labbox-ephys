import React from 'react'
import { connect } from 'react-redux'
import NiceTable from '../components/NiceTable'
import { deleteRecordings } from '../actions';
import { Link } from 'react-router-dom';

const RecordingsTable = ({ recordings, onDeleteRecordings }) => {

    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    recordings = sortByKey(recordings, 'recordingId');

    const rows = recordings.map(rec => ({
        recording: rec,
        key: rec.recordingId,
        recordingId: {
            text: rec.recordingId,
            element: <Link title={"View this recording"} to={`/recording/${rec.recordingId}`}>{rec.recordingId}</Link>,
        },
        numChannels: rec.recordingInfo.channel_ids.length,
        samplingFrequency: rec.recordingInfo.sampling_frequency,
        durationMinutes: rec.recordingInfo.num_frames / rec.recordingInfo.sampling_frequency / 60
    }));

    const columns = [
        {
            key: 'recordingId',
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
                onDeleteRow={(row) => onDeleteRecordings([row.recording.recordingId])}
            />
        </div>
    );
}

const mapStateToProps = state => ({
    recordings: state.recordings
})

const mapDispatchToProps = dispatch => ({
    onDeleteRecordings: recordingIds => dispatch(deleteRecordings(recordingIds))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RecordingsTable)
