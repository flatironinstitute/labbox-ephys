import { CircularProgress } from '@material-ui/core';
import React, { FunctionComponent, useContext, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getRecordingInfo } from '../actions/getRecordingInfo';
import NiceTable from '../components/NiceTable';
import { HitherContext } from '../extensions/common/hither';
import { getPathQuery } from '../kachery';
import { Recording, RecordingInfo } from '../reducers/recordings';
import { Sorting } from '../reducers/sortings';
import { WorkspaceInfo } from '../reducers/workspaceInfo';

interface Props {
    workspaceInfo: WorkspaceInfo
    recordings: Recording[]
    sortings: Sorting[]
    onDeleteRecordings: (recordingIds: string[]) => void
    onSetRecordingInfo: (a: { recordingId: string, recordingInfo: RecordingInfo }) => void
}

const sortingElement = (sorting: Sorting) => {
    return <span>{sorting.sortingId} ({sorting.sortingInfo ? sorting.sortingInfo.unit_ids.length : ''})</span>
}

const sortingsElement = (sortings: Sorting[]) => {
    return (
        <span>
            {
                sortings.map(s => (
                    sortingElement(s)
                ))
            }
        </span>
    )
}

const RecordingsTable: FunctionComponent<Props> = ({ recordings, sortings, onDeleteRecordings, onSetRecordingInfo, workspaceInfo }) => {
    const hither = useContext(HitherContext)
    const { workspaceName, feedUri, readOnly } = workspaceInfo;

    const sortingsByRecordingId: {[key: string]: Sorting[]} = useMemo(() => {
        const ret: {[key: string]: Sorting[]} = {}
        recordings.forEach(r => {
            ret[r.recordingId] = sortings.filter(s => (s.recordingId === r.recordingId))
        })
        return ret
    }, [recordings, sortings])

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
                        const info = await getRecordingInfo({recordingObject: rec.recordingObject, hither});
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

    const rows = useMemo(() => (recordings.map(rec => ({
        key: rec.recordingId,
        columnValues: {
            recording: rec,
            recordingLabel: {
                text: rec.recordingLabel,
                element: <Link title={"View this recording"} to={`/${workspaceName}/recording/${rec.recordingId}${getPathQuery({feedUri})}`}>{rec.recordingLabel}</Link>,
            },
            numChannels: rec.recordingInfo ? rec.recordingInfo.channel_ids.length : {element: <CircularProgress />},
            samplingFrequency: rec.recordingInfo ? rec.recordingInfo.sampling_frequency : '',
            durationMinutes: rec.recordingInfo ? rec.recordingInfo.num_frames / rec.recordingInfo.sampling_frequency / 60 : '',
            sortings: { element: sortingsElement(sortingsByRecordingId[rec.recordingId]) }
        }
    }))), [recordings, sortingsByRecordingId, feedUri, workspaceName])

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
        },
        {
            key: 'sortings',
            label: 'Sortings'
        }
    ]

    return (
        <div>
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this recording"}
                onDeleteRow={readOnly ? undefined : (key, columnValues) => onDeleteRecordings([key])}
            />
        </div>
    );
}

export default RecordingsTable