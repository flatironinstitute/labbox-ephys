import React, { useState, useEffect, Fragment } from 'react'

import { createHitherJob } from '../hither'
import { CircularProgress, Button } from '@material-ui/core'
import NiceTable from './NiceTable'

const ImportRecordingFromLocalDisk = ({ onDone, existingRecordingIds, onAddRecording }) => {
    const [status, setStatus] = useState('initial');
    const [importableRecordings, setImportableRecordings] = useState(null);
    const [selectedRecordingId, setSelectedRecordingId] = useState(null);
    const [importErrorMessage, setImportErrorMessage] = useState(null);

    const selectedRecording = () => {
        return importableRecordings.filter(r => (r.id === selectedRecordingId))[0];
    }

    const handleImportSelectedRecording = () => {
        const rec = selectedRecording();
        if (existingRecordingIds.filter(id => (id === rec.id))[0]) {
            setImportErrorMessage(`Cannot import. Duplicate id: ${rec.id}`);
            return;
        }
        setImportErrorMessage('');
        onAddRecording({
            recordingId: rec.id,
            recordingPath: rec.path,
            recordingObject: rec.recording_object
        })
        onDone();
    }

    const effect = async () => {
        if (status === 'initial') {
            setStatus('loading');
            let result;
            try {
                result = await createHitherJob(
                    'get_importable_recordings',
                    {},
                    {
                        useClientCache: false,
                        wait: true
                    }
                )
            }
            catch(err) {
                console.error(err);
                setStatus('error');
                return;
            }
            setImportableRecordings(result);
            setStatus('finished');
        }    
    }
    useEffect(() => {effect();})

    if (!status) {
        return <div>Waiting...</div>;
    }
    else if (status === 'loading') {
        return <CircularProgress />
    }
    else if (status === 'error') {
        return <div>Error loading local data directory.</div>
    }
    else if (status === 'finished') {
        return (
            <div>
                <TheTable
                    importableRecordings={importableRecordings}
                    selectedRecordingId={selectedRecordingId}
                    onSetSelectedRecordingId={id => {setImportErrorMessage(""); setSelectedRecordingId(id)}}
                />
                {
                    selectedRecordingId && (
                        <Fragment>
                            <Button
                                onClick={() => handleImportSelectedRecording()}
                            >
                                Import {selectedRecordingId}
                            </Button>
                            {
                                importErrorMessage && <span style={{color: 'red'}}>{importErrorMessage}</span>
                            }
                        </Fragment>
                    )
                }
            </div>
            
        );
    }
    else {
        return <div>Unexpected status: {status}</div>
    }
}

const TheTable = ({ importableRecordings, selectedRecordingId, onSetSelectedRecordingId }) => {
    const rows = importableRecordings.map(r => (
        {
            key: r.id,
            id: r.id,
            path: r.path,
            recordingObject: r.recording_object,
            numChannels: r.recording_info.channel_ids.length,
            samplingFrequency: r.recording_info.sampling_frequency,
            durationMin: r.recording_info.num_frames / r.recording_info.sampling_frequency / 60
        }
    ))
    const columns = [
        {
            label: 'Importable recording',
            key: 'id'
        },
        {
            label: 'Num. channels',
            key: 'numChannels'
        },
        {
            label: 'Sampling freq. (Hz)',
            key: 'samplingFrequency'
        },
        {
            label: 'Duration (min)',
            key: 'durationMin'
        }
    ];
    return (
        <NiceTable
            rows={rows}
            columns={columns}
            selectionMode='single'
            selectedRowKeys={selectedRecordingId ? [selectedRecordingId] : []}
            onSelectedRowKeysChanged={(keys) => {onSetSelectedRecordingId(keys[0] || null)}}
        />
    )
}

export default ImportRecordingFromLocalDisk