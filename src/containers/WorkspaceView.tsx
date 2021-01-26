import { Button } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useState } from 'react';
import Splitter from '../extensions/common/Splitter';
import { Recording, RecordingInfo } from '../reducers/recordings';
import { Sorting } from '../reducers/sortings';
import { WorkspaceInfo } from '../reducers/workspaceInfo';
import ImportRecordingsInstructions from './ImportRecordingsInstructions';
import RecordingsTable from './RecordingsTable';

type Props = {
    workspaceInfo: WorkspaceInfo
    sortings: Sorting[]
    recordings: Recording[]
    onDeleteRecordings: (recordingIds: string[]) => void
    onSetRecordingInfo: (a: { recordingId: string, recordingInfo: RecordingInfo }) => void
    width: number
    height: number
}

const WorkspaceView: FunctionComponent<Props> = ({ width, height, sortings, recordings, onDeleteRecordings, onSetRecordingInfo, workspaceInfo }) => {
    const [showImportInstructions, setShowImportInstructions] = useState(false)
    const handleImport = useCallback(() => {
        setShowImportInstructions(true)
    }, [])
    return (
        <Splitter
            {...{width, height}}
            initialPosition={300}
            positionFromRight={true}
        >
            <div>
                {
                    !showImportInstructions && (
                        <div><Button onClick={handleImport}>Import recordings</Button></div>
                    )
                }
                <RecordingsTable
                    {...{sortings, recordings, onDeleteRecordings, onSetRecordingInfo, workspaceInfo}}
                />
            </div>
            {
                showImportInstructions && (
                    <ImportRecordingsInstructions />
                )
            }
        </Splitter>
    )
}

export default WorkspaceView