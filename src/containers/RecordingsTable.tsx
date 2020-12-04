import { CircularProgress } from '@material-ui/core';
import React, { Dispatch, FunctionComponent, useEffect } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteRecordings, setRecordingInfo } from '../actions';
import { getRecordingInfo } from '../actions/getRecordingInfo';
import NiceTable from '../components/NiceTable';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { DocumentInfo } from '../reducers/documentInfo';
import { Recording, RecordingInfo } from '../reducers/recordings';

interface StateProps {
    recordings: Recording[],
    documentInfo: DocumentInfo
}

interface DispatchProps {
    onDeleteRecordings: (recordingIds: string[]) => void
    onSetRecordingInfo: (a: { recordingId: string, recordingInfo: RecordingInfo }) => void
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

const RecordingsTable: FunctionComponent<Props> = ({ recordings, onDeleteRecordings, onSetRecordingInfo, documentInfo }) => {
    const { documentId, feedUri, readOnly } = documentInfo;

    function sortByKey<T extends {[key: string]: any}>(array: T[], key: string): T[] {
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
                onDeleteRow={readOnly ? null : (row: {recording: {recordingId: string}}) => onDeleteRecordings([row.recording.recordingId])}
            />
        </div>
    );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    recordings: state.recordings,
    documentInfo: state.documentInfo
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    onDeleteRecordings: (recordingIds: string[]) => deleteRecordings(dispatch, recordingIds),
    onSetRecordingInfo: ({ recordingId, recordingInfo }) => dispatch(setRecordingInfo({ recordingId, recordingInfo }))
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(RecordingsTable)