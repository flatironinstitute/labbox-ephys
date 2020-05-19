import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import NiceTable from '../components/NiceTable'
import { deleteRecordings, setRecordingInfo, sleep } from '../actions';
import { createHitherJob } from '../hither';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';

const RecordingsTable = ({ recordings, onDeleteRecordings, onSetRecordingInfo }) => {

    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    recordings = sortByKey(recordings, 'recordingId');

    const effect = async () => {
        for (const rec of recordings) {
            if (!rec.recordingInfo) {
                let info;
                try {
                    // for a nice gui effect
                    await sleep(400);
                    const recordingInfoJob = await createHitherJob(
                        'get_recording_info',
                        { recording_object: rec.recordingObject },
                        {
                            kachery_config: {},
                            hither_config: {
                                job_handler_role: 'general'
                            },
                            auto_substitute_file_objects: true,
                            useClientCache: true
                        }
                    )
                    info = await recordingInfoJob.wait();
                    onSetRecordingInfo({ recordingId: rec.recordingId, recordingInfo: info });
                }
                catch (err) {
                    console.error(err);
                    return;
                }
            }
        }
    }
    useEffect(() => { effect() })

    const rows = recordings.map(rec => ({
        recording: rec,
        key: rec.recordingId,
        recordingId: {
            text: rec.recordingId,
            element: <Link title={"View this recording"} to={`/recording/${rec.recordingId}`}>{rec.recordingId}</Link>,
        },
        numChannels: rec.recordingInfo ? rec.recordingInfo.channel_ids.length : {element: <CircularProgress />},
        samplingFrequency: rec.recordingInfo ? rec.recordingInfo.sampling_frequency : '',
        durationMinutes: rec.recordingInfo ? rec.recordingInfo.num_frames / rec.recordingInfo.sampling_frequency / 60 : ''
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
    onDeleteRecordings: recordingIds => dispatch(deleteRecordings(recordingIds)),
    onSetRecordingInfo: ({ recordingId, recordingInfo }) => dispatch(setRecordingInfo({ recordingId, recordingInfo }))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RecordingsTable)
