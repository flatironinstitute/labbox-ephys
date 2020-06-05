import React, { useState, useEffect, Fragment } from 'react'
import { createHitherJob } from '../hither'
import { CircularProgress, Button } from '@material-ui/core';
import NiceTable from './NiceTable';

const ImportRecordingFromFrankLabDataJoint = ({ onDone, onAddRecording, frankLabDataJointConfig }) => {
    const [status, setStatus] = useState('initial');
    const [importableRecordings, setImportableRecordings] = useState(null);
    const [selectedRecordingLabel, setSelectedRecordingLabel] = useState(null);
    const [importErrorMessage, setImportErrorMessage] = useState(null);

    const validConfig = ((frankLabDataJointConfig.port) && (frankLabDataJointConfig.user));
    const effect = async () => {
        if (!validConfig) return;
        if (status === 'initial') {
            setStatus('loading');
            let result;
            try {
                result = await createHitherJob(
                    'get_franklab_datajoint_importable_recordings',
                    {
                        config: frankLabDataJointConfig
                    },
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

    const selectedRecording = () => {
        return importableRecordings.filter(r => (r.label === selectedRecordingLabel))[0];
    }

    const handleImportSelectedRecording = () => {
        const rec = selectedRecording();
        setImportErrorMessage('');
        onAddRecording({
            recordingId: randomString(10),
            recordingLabel: rec.label,
            recordingPath: rec.path,
            recordingObject: rec.recording_object
        })
        onDone();
    }

    if (!validConfig) {
        return (
            <div>
                You must provide a valid configuration. Use the "CONFIG -> FrankLab DataJoint" page.
            </div>
        )
    }

    if (!status) {
        return <div>Waiting...</div>;
    }
    else if (status === 'loading') {
        return (
            <div>
                <CircularProgress />
                Loading importable recordings from DataJoint...
            </div>
            
        )
    }
    else if (status === 'error') {
        return <div>Error loading data.</div>
    }
    else if (status === 'finished') {
        return (
            <div>
                <TheTable
                    importableRecordings={importableRecordings}
                    selectedRecordingLabel={selectedRecordingLabel}
                    onSetSelectedRecordingLabel={label => {setImportErrorMessage(""); setSelectedRecordingLabel(label)}}
                />
                {
                    selectedRecordingLabel && (
                        <Fragment>
                            <Button
                                onClick={() => handleImportSelectedRecording()}
                            >
                                Import {selectedRecordingLabel}
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

const TheTable = ({ importableRecordings, selectedRecordingLabel, onSetSelectedRecordingLabel }) => {
    const rows = importableRecordings.map(r => (
        {
            key: r.label,
            label: r.label,
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
            key: 'label'
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
            selectedRowKeys={selectedRecordingLabel ? [selectedRecordingLabel] : []}
            onSelectedRowKeysChanged={(keys) => {onSetSelectedRecordingLabel(keys[0] || null)}}
        />
    )
}

function randomString(num_chars) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default ImportRecordingFromFrankLabDataJoint