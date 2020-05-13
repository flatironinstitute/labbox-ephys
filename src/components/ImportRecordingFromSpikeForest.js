import React, { useState, Fragment, useEffect } from 'react'
import { Input, FormGroup, FormControl, InputLabel, Button, CircularProgress, Select, MenuItem, makeStyles } from '@material-ui/core'
import { createHitherJob } from '../hither'
import { sleep } from '../actions'
import RecordingInfoView from '../components/RecordingInfoView';

const ImportRecordingFromSpikeForest = ({ onDone, existingRecordingIds, onAddRecording, examplesMode }) => {
    const [recordingPath, setRecordingPath] = useState('');
    const [recordingObject, setRecordingObject] = useState(null);
    const [recordingInfo, setRecordingInfo] = useState(null);
    const [recordingInfoStatus, setRecordingInfoStatus] = useState('');;
    const [recordingId, setRecordingId] = useState('');
    const [errors, setErrors] = useState({});

    const effect = async () => {
        if ((recordingPath) && (!recordingObject) && (!recordingInfo) && (!recordingInfoStatus)) {
            setRecordingInfoStatus('calculating');
            let info;
            try {
                await sleep(500);
                const obj = await createHitherJob(
                    'get_recording_object',
                    {
                        recording_path: recordingPath
                    },
                    {
                        wait: true
                    }
                )
                setRecordingObject(obj);
                const info = await createHitherJob(
                    'get_recording_info',
                    { recording_object: obj },
                    {
                        kachery_config: {},
                        hither_config: {
                            job_handler_role: 'general'
                        },
                        auto_substitute_file_objects: true,
                        wait: true
                    }
                )
                
                setRecordingInfo(info);
                setRecordingInfoStatus('finished');
            }
            catch (err) {
                console.error(err);
                setRecordingInfoStatus('error');
                return;
            }
        }
    }
    useEffect(() => {effect()});

    if ((recordingInfo) && (recordingId === '<>')) {
        setRecordingId(autoDetermineRecordingIdFromPath(recordingPath))
    }
    if ((!recordingInfo) && (recordingId !== '<>')) {
        setRecordingId('<>');
    }

    const handleImport = () => {
        let newErrors = {};
        if (!recordingId) {
            newErrors.recordingId = { type: 'required' };
        }
        if (recordingId in Object.fromEntries(existingRecordingIds.map(id => [id, true]))) {
            newErrors.recordingId = { type: 'duplicate-id' };
        }
        if (!recordingPath) {
            newErrors.recordingPath = { type: 'required' };
        }
        setErrors(newErrors);
        if (!isEmptyObject(newErrors)) {
            return;
        }
        const recording = {
            recordingId,
            recordingPath,
            recordingObject
        }
        onAddRecording(recording);
        onDone && onDone();
    }

    return (
        <div>
            <h1>Import recording from SpikeForest</h1>
            <p>Enter the sha1:// URI of the recording as the recording path</p>
            <form autoComplete="off">
                <RecordingPathControl
                    examplesMode={examplesMode}
                    value={recordingPath}
                    onChange={value => setRecordingPath(value)}
                    errors={errors}
                />

                {recordingInfo && (
                    (
                        <Fragment>
                            <RecordingIdControl
                                value={recordingId}
                                onChange={(val) => setRecordingId(val)}
                                errors={errors}
                            />
                            <FormGroup row={true} style={formGroupStyle}>
                                <Button
                                    variant="contained"
                                    type="button"
                                    onClick={() => handleImport()}
                                >
                                    Import
                                </Button>
                            </FormGroup>
                        </Fragment>
                    )
                )}

                {
                    <Fragment>
                        <h3>{recordingPath}</h3>
                        {
                            recordingInfoStatus === 'calculating' ? (
                                <CircularProgress />
                            ) : (
                                    recordingInfo && <RecordingInfoView recordingInfo={recordingInfo} />
                                )
                        }
                    </Fragment>
                }
            </form >
        </div>
    )
}

function autoDetermineRecordingIdFromPath(path) {
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
const duplicateId = "Duplicate recording ID";
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

const SelectExampleRecordingPath = ({ value, onChange }) => {
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

const RecordingPathControl = ({ value, onChange, errors, examplesMode }) => {
    const [internalValue, setInternalValue] = useState(value);

    const e = errors.recordingPath || {};
    return (
        <div>
            {
                examplesMode && (
                    <SelectExampleRecordingPath
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
                        disabled={false}
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
                        style={{ width: 30 }}
                    >
                        Update
                        </Button>
                }
            </FormGroup>
        </div>
    );
}

const RecordingIdControl = ({ value, onChange, errors }) => {
    const e = errors.recordingId || {};
    return (
        <FormGroup style={formGroupStyle}>
            <FormControl>
                <InputLabel>Recording ID</InputLabel>
                <Input
                    name="recordingId"
                    readOnly={false}
                    disabled={false}
                    value={value}
                    onChange={(event) => { onChange(event.target.value); }}
                />
            </FormControl>
            {e.type === "required" && errorMessage(required)}
            {e.type === "duplicate-id" && errorMessage(duplicateId)}
            {e.type === "maxLength" && errorMessage(maxLength)}
        </FormGroup>
    );
}

function isEmptyObject(x) {
    return Object.keys(x).length === 0;
}

export default ImportRecordingFromSpikeForest