import { Button } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useState } from 'react';
import Splitter from '../common/Splitter';
import { Recording, Sorting } from '../extensionInterface';
import ImportRecordingsInstructions from './ImportRecordingsInstructions';
import RecordingsTable from './RecordingsTable';
import { WorkspaceInfo, WorkspaceRouteDispatch } from './WorkspaceView';

type Props = {
    workspaceInfo: WorkspaceInfo
    defaultFeedId: string
    sortings: Sorting[]
    recordings: Recording[]
    onDeleteRecordings: (recordingIds: string[]) => void
    width: number
    height: number
    workspaceRouteDispatch: WorkspaceRouteDispatch
}

const WorkspaceRecordingsView: FunctionComponent<Props> = ({ width, height, sortings, recordings, onDeleteRecordings, workspaceInfo, defaultFeedId, workspaceRouteDispatch }) => {
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
                    <ImportRecordingsInstructions
                        feedUri={workspaceInfo.feedUri || 'feed://' + defaultFeedId || '<>'}
                        workspaceName={workspaceInfo.workspaceName || 'default'}
                    />
                )
            }
        </Splitter>
    )
}

export default WorkspaceRecordingsView