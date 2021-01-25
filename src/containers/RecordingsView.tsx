import { Button } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useState } from 'react';
import Splitter from '../extensions/common/Splitter';
import ImportRecordingsInstructions from './ImportRecordingsInstructions';
import RecordingsTable from './RecordingsTable';

type Props = {
    width: number
    height: number
}

const RecordingsView: FunctionComponent<Props> = ({ width, height }) => {
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
                <RecordingsTable />
            </div>
            {
                showImportInstructions && (
                    <ImportRecordingsInstructions />
                )
            }
        </Splitter>
    )
}

export default RecordingsView