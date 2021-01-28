import { Button } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { WorkspaceInfo } from '../AppContainer';
import Splitter from '../extensions/common/Splitter';
import { Recording } from '../reducers/recordings';
import { Sorting } from '../reducers/sortings';
import ImportRecordingsInstructions from './ImportRecordingsInstructions';
import RecordingsTable from './RecordingsTable';
import { WorkspaceRouteDispatch } from './WorkspaceView';

type Props = {
    workspaceInfo: WorkspaceInfo
    sortings: Sorting[]
    recordings: Recording[]
    onDeleteRecordings: (recordingIds: string[]) => void
    width: number
    height: number
    workspaceRouteDispatch: WorkspaceRouteDispatch
}

const WorkspaceRecordingsView: FunctionComponent<Props> = ({ width, height, sortings, recordings, onDeleteRecordings, workspaceInfo, workspaceRouteDispatch }) => {
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
                    {...{sortings, recordings, onDeleteRecordings, workspaceInfo, workspaceRouteDispatch}}
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

export default WorkspaceRecordingsView