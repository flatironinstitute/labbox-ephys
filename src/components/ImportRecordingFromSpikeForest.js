import { Button, CircularProgress, FormControl, FormGroup, Input, InputLabel, makeStyles, MenuItem, Select } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { sleep } from '../actions';
import RecordingInfoView from '../components/RecordingInfoView';

const ImportRecordingFromSpikeForest = ({ onDone, onAddRecording, examplesMode, hither }) => {
    const [recordingPath, setRecordingPath] = useState('');
    const [recordingObject, setRecordingObject] = useState(null);
    const [recordingInfo, setRecordingInfo] = useState(null);
    const [recordingInfoStatus, setRecordingInfoStatus] = useState('');
    const [downloadStatus, setDownloadStatus] = useState('');
    const [recordingLabel, setRecordingLabel] = useState('');
    const [errors, setErrors] = useState({});

    const effect = async () => {
        if ((!recordingInfoStatus) && (recordingPath)) {
            // trigger loading of recording info
            setRecordingInfoStatus('pending');
        }
        if (recordingInfoStatus === 'pending') {
            // we need to calculate the recording object and info from the recording path
            setRecordingInfoStatus('calculating');
            try {
                await sleep(500);
                const obj = await hither.createHitherJob(
                    'get_recording_object',
                    {
                        recording_path: recordingPath
                    },
                    {
                        useClientCache: false
                    }
                ).wait()
                setRecordingObject(obj);
                const info = await hither.createHitherJob(
                    'get_recording_info',
                    { recording_object: obj },
                    {
                        kachery_config: {},
                        hither_config: {
                        },
                        job_handler_name: 'default',
                        // if we do not substitute file objects, then it does not get downloaded
                        auto_substitute_file_objects: false,
                        useClientCache: false
                    }
                ).wait()
                
                setRecordingInfo(info);
                setRecordingInfoStatus('calculated');
            }
            catch (err) {
                console.error(err);
                setRecordingInfoStatus('error');
                return;
            }
        }
        if (downloadStatus === 'pending') {
            // we need to download the recording
            setDownloadStatus('downloading');
            try {
                await hither.createHitherJob(
                    'download_recording',
                    { recording_object: recordingObject },
                    {
                        kachery_config: {},
                        hither_config: {},
                        auto_substitute_file_objects: false,
                        wait: true,
                        useClientCache: false
                    }
                ).wait()
                setDownloadStatus('downloaded');
                // Let's now recompute the recording info
                setRecordingInfoStatus('pending');
            }
            catch(err) {
                console.error(err);
                setDownloadStatus('error');
                return;
            }
        }
    }
    useEffect(() => {effect()});

    if ((!recordingInfo) && (recordingLabel !== '<>')) {
        setRecordingLabel('<>');
    }

    const handleImport = () => {
        let newErrors = {};
        let recordingLabel2 = recordingLabel === '<>' ? autoDetermineRecordingLabelFromPath(recordingPath) : recordingLabel;
        if (!recordingLabel2) {
            newErrors.recordingLabel = { type: 'required' };
        }
        if (!recordingPath) {
            newErrors.recordingPath = { type: 'required' };
        }
        setErrors(newErrors);
        if (!isEmptyObject(newErrors)) {
            return;
        }
        const recording = {
            recordingId: randomString(10),
            recordingLabel: recordingLabel2,
            recordingPath,
            recordingObject
        }
        onAddRecording(recording);
        onDone && onDone();
    }

    const handleDownload = () => {
        setDownloadStatus('pending');
    }

    let showImportButton = false;
    let showDownloadButton = false;
    if (recordingInfoStatus === 'calculated') {
        if (recordingInfo.is_local) {
            showImportButton = true;
        }
        else {
            showDownloadButton = true;
        }
    }
    if (downloadStatus === 'downloading') {
        showDownloadButton = false;
    }

    const controlsDisabled = ((downloadStatus === 'downloading') || (recordingInfoStatus === 'calculating'));

    return (
        <div>
            <h1>Import recording from SpikeForest</h1>
            <p>Enter the sha1:// URI of the recording as the recording path</p>
            <form autoComplete="off">
                <RecordingPathControl
                    examplesMode={examplesMode}
                    value={recordingPath}
                    disabled={controlsDisabled}
                    onChange={value => {setRecordingPath(value); setRecordingInfo(null); setRecordingInfoStatus(''); setRecordingLabel('<>')}}
                    errors={errors}
                />

                {
                    recordingPath &&
                    (
                        <RecordingLabelControl
                            value={recordingLabel === '<>' ? autoDetermineRecordingLabelFromPath(recordingPath) : recordingLabel}
                            onChange={(val) => setRecordingLabel(val)}
                            disabled={controlsDisabled}
                            errors={errors}
                        />
                    )
                }

                {
                    downloadStatus === 'downloading' && (
                        <div><CircularProgress /> Downloading recording</div>
                    )
                }
                {
                    showDownloadButton && (
                        <FormGroup row={true} style={formGroupStyle}>
                            <Button
                                variant="contained"
                                type="button"
                                onClick={() => handleDownload()}
                            >
                                Download
                            </Button>
                        </FormGroup>
                    )
                }

                {
                    showImportButton && (
                        <FormGroup row={true} style={formGroupStyle}>
                            <Button
                                variant="contained"
                                type="button"
                                onClick={() => handleImport()}
                            >
                                Import
                            </Button>
                        </FormGroup>
                    )
                }
                {
                    recordingInfoStatus === 'calculating' ? (
                        <CircularProgress />
                    ) : (
                        recordingInfo && <RecordingInfoView recordingInfo={recordingInfo} />
                    )
                }
            </form >
        </div>
    )
}

function autoDetermineRecordingLabelFromPath(path) {
    if (path.startsWith('sha1://') || (path.startsWith('sha1dir://'))) {
        let x = path.split('/').slice(2);
        let y = x[0].split('.');
        if (y.length > 1) {
            return y.slice(1).join('.') + '/' + x.slice(1).join('/');
        }
        else {
            return x.slice(1).join('/');
        }
    }
    else {
        return path;
    }
}

const formGroupStyle = {
    paddingTop: 25
};

// Messages
const required = "This field is required";
const maxLength = "Your input exceeds maximum length";

const errorMessage = error => {
    return <div className="invalid-feedback">{error}</div>;
};

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 240,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

const SelectExampleRecordingPath = ({ value, onChange, disabled=false }) => {
    const examplePaths = [
        "sha1dir://49b1fe491cbb4e0f90bde9cfc31b64f985870528.paired_boyden32c/419_1_7",
        "sha1dir://49b1fe491cbb4e0f90bde9cfc31b64f985870528.paired_boyden32c/419_1_8",
        "sha1dir://51570fce195942dcb9d6228880310e1f4ca1395b.paired_kampff/2014_11_25_Pair_3_0",
        "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth"
    ]

    const classes = useStyles();

    return (
        <FormControl className={classes.formControl}>
            <InputLabel id="select-example-label">Select example&nbsp;</InputLabel>
            <Select
                labelId="select-example-label"
                id="select-example"
                disabled={disabled}
                value={value}
                onChange={evt => { onChange(evt.target.value) }}
            >
                {
                    examplePaths.map((path, ii) => (
                        <MenuItem key={ii} value={path}>{path}</MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    )
}

const RecordingPathControl = ({ value, onChange, errors, examplesMode, disabled=false }) => {
    const [internalValue, setInternalValue] = useState(value);

    const e = errors.recordingPath || {};
    return (
        <div>
            {
                examplesMode && (
                    <SelectExampleRecordingPath
                        disabled={disabled}
                        value={internalValue}
                        onChange={path => {
                            setInternalValue(path);
                            onChange(path);
                        }}
                    />
                )
            }
            <FormGroup style={formGroupStyle}>
                <FormControl style={{ visibility: examplesMode ? "hidden" : "visible" }}>
                    <InputLabel>Recording path</InputLabel>
                    <Input
                        name="recordingPath"
                        readOnly={false}
                        disabled={disabled}
                        value={internalValue}
                        onChange={(event) => { setInternalValue(event.target.value); }}
                    />
                </FormControl>
                {e.type === "required" && errorMessage(required)}
                {e.type === "maxLength" && errorMessage(maxLength)}
                {
                    (internalValue !== value) &&
                    <Button
                        onClick={() => onChange(internalValue)}
                        disabled={disabled}
                        style={{ width: 30 }}
                    >
                        Update
                        </Button>
                }
            </FormGroup>
        </div>
    );
}

function randomString(num_chars) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

const RecordingLabelControl = ({ value, onChange, errors, disabled=false }) => {
    const e = errors.recordingLabel || {};
    return (
        <FormGroup style={formGroupStyle}>
            <FormControl>
                <InputLabel>Recording Label</InputLabel>
                <Input
                    name="recordingLabel"
                    readOnly={false}
                    disabled={disabled}
                    value={value}
                    onChange={(event) => { onChange(event.target.value); }}
                />
            </FormControl>
            {e.type === "required" && errorMessage(required)}
            {e.type === "maxLength" && errorMessage(maxLength)}
        </FormGroup>
    );
}

function isEmptyObject(x) {
    return Object.keys(x).length === 0;
}

export default ImportRecordingFromSpikeForest