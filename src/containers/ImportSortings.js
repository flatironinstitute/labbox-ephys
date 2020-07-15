import React, { useState, Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { Input, FormGroup, FormControl, InputLabel, Button, CircularProgress, FormLabel, RadioGroup, FormControlLabel, Radio, Select, MenuItem, makeStyles } from '@material-ui/core'
import { addSorting, sleep } from '../actions';
import { createHitherJob } from '../hither';
import { withRouter } from 'react-router-dom';
import SortingInfoView from '../components/SortingInfoView';

const ImportSortings = ({ recordingId, recordingLabel, recordings, onAddSorting, history, documentId, feedId }) => {
    const [method, setMethod] = useState('examples');

    const recording = recordings.filter(r => (r.recordingId === recordingId))[0];
    if (!recording) {
        return <div>{`Recording not found: ${recordingId}`}</div>;
    }
    const recordingPath = recording.recordingPath;
    const recordingObject = recording.recordingObject;

    const handleDone = () => {
        history.push(`/f/${feedId}/d/${documentId}/recording/${recordingId}`);
    }

    let form;
    if (method === 'spikeforest') {
        form = (
            <ImportSortingFromSpikeForest
                examplesMode={false}
                recordingId={recordingId}
                recordingPath={recordingPath}
                recordingObject={recordingObject}
                onAddSorting={onAddSorting}
                onDone={handleDone}
            />
        )
    }
    else if (method === 'examples') {
        form = (
            <ImportSortingFromSpikeForest
                examplesMode={true}
                recordingId={recordingId}
                recordingPath={recordingPath}
                recordingObject={recordingObject}
                onAddSorting={onAddSorting}
                onDone={handleDone}
            />
        )
    }
    else if (method === 'local') {
        form = (
            <p>
                Import from local computer not yet implemented.
            </p>
        )
    }
    else {
        form = <span>{`Invalid method: ${method}`}</span>
    }
    return (
        <div>
            <div>
                <h1>{`Import sorting for ${recordingLabel}`}</h1>
                <RadioChoices
                    label="Sorting import method"
                    value={method}
                    onSetValue={setMethod}
                    options={[
                        {
                            value: 'examples',
                            label: 'Examples'
                        },
                        {
                            value: 'spikeforest',
                            label: 'From SpikeForest'
                        },
                        {
                            value: 'local',
                            label: 'From local computer (not yet implemented)'
                        },
                        {
                            value: 'other',
                            label: 'Other (not yet implemented)',
                            disabled: true
                        }
                    ]}
                />
            </div>
            {form}
        </div>
    )
}

const RadioChoices = ({ label, value, onSetValue, options }) => {
    return (
        <FormControl component="fieldset">
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup value={value} onChange={(evt) => onSetValue(evt.target.value)}>
                {
                    options.map(opt => (
                        <FormControlLabel
                            key={opt.label}
                            value={opt.value}
                            control={<Radio />}
                            label={opt.label}
                            disabled={opt.disabled ? true : false}
                        />
                    ))
                }
            </RadioGroup>
        </FormControl>
    );
}

const ImportSortingFromSpikeForest = ({ onDone, onAddSorting, examplesMode, recordingId, recordingPath, recordingObject }) => {
    const [sortingPath, setSortingPath] = useState('');
    const [sortingObject, setSortingObject] = useState(null);
    const [sortingLabel, setSortingLabel] = useState('');
    const [errors, setErrors] = useState({});
    const [sortingInfo, setSortingInfo] = useState(null);
    const [sortingInfoStatus, setSortingInfoStatus] = useState(null);

    const effect = async () => {
        if ((sortingPath) && (!sortingObject) && (!sortingInfo)) {
            setSortingInfoStatus('calculating');
            let info;
            try {
                await sleep(500);
                const obj = await createHitherJob(
                    'get_sorting_object',
                    {
                        sorting_path: sortingPath,
                        recording_object: recordingObject
                    },
                    {
                        wait: true,
                        useClientCache: false
                    }
                )
                setSortingObject(obj);
                const info = await createHitherJob(
                    'get_sorting_info',
                    { sorting_object: obj, recording_object: recordingObject },
                    {
                        kachery_config: {},
                        hither_config: {
                            job_handler_role: 'general'
                        },
                        wait: true,
                        auto_substitute_file_objects: true,
                        useClientCache: false
                    }
                )
                setSortingInfo(info);
                setSortingInfoStatus('finished');
            }
            catch (err) {
                console.error(err);
                setSortingInfoStatus('error');
                return;
            }
        }
    }
    useEffect(() => {effect()});

    // const srPath = sortingPath + '::::' + recordingPath;

    if ((sortingInfo) && (sortingLabel === '<>')) {
        setSortingLabel(autoDetermineSortingLabelFromPath(sortingPath))
    }
    if ((!sortingInfo) && (sortingLabel !== '<>')) {
        setSortingLabel('<>');
    }

    const handleImport = () => {
        let newErrors = {};
        if (!sortingLabel) {
            newErrors.sortingLabel = {type: 'required'};
        }
        if (!sortingPath) {
            newErrors.sortingPath = {type: 'required'};
        }
        setErrors(newErrors);
        if (!isEmptyObject(newErrors)) {
            return;
        }
        const sorting = {
            sortingId: randomString(10),
            sortingLabel,
            sortingPath,
            sortingObject,
            recordingId,
            recordingPath,
            recordingObject
        }
        onAddSorting(sorting);
        onDone && onDone();
    }

    return (
        <div>
            <h1>Import sorting from SpikeForest</h1>
            <p>Enter the sha1:// URI of the sorting as the sorting path</p>
            <form autoComplete="off">
                <SortingPathControl
                    examplesMode={examplesMode}
                    value={sortingPath}
                    onChange={value => setSortingPath(value)}
                    errors={errors}
                    recordingPath={recordingPath}
                />

                {sortingInfo && (
                    <Fragment>
                        <SortingLabelControl
                            value={sortingLabel}
                            onChange={(val) => setSortingLabel(val)}
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
                )}
                {
                    <Fragment>
                        <h3>{sortingPath}</h3>
                        {
                            sortingInfoStatus === 'calculating' ? (
                                <CircularProgress />
                            ) : (
                                    sortingInfo && <SortingInfoView sortingInfo={sortingInfo} />
                                )
                        }
                    </Fragment>
                }
            </form >
        </div>
    )
}

function randomString(num_chars) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function autoDetermineSortingLabelFromPath(path) {
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

const SelectExampleSortingPath = ({ value, onChange, recordingPath }) => {
    const examplePaths = [
        {
            recordingPath: "sha1dir://49b1fe491cbb4e0f90bde9cfc31b64f985870528.paired_boyden32c/419_1_7",
            sortingPath: "sha1dir://49b1fe491cbb4e0f90bde9cfc31b64f985870528.paired_boyden32c/419_1_7/firings_true.mda"
        },
        {
            recordingPath: "sha1dir://49b1fe491cbb4e0f90bde9cfc31b64f985870528.paired_boyden32c/419_1_8",
            sortingPath: "sha1dir://49b1fe491cbb4e0f90bde9cfc31b64f985870528.paired_boyden32c/419_1_8/firings_true.mda"
        },
        {
            recordingPath: "sha1dir://51570fce195942dcb9d6228880310e1f4ca1395b.paired_kampff/2014_11_25_Pair_3_0",
            sortingPath: "sha1dir://51570fce195942dcb9d6228880310e1f4ca1395b.paired_kampff/2014_11_25_Pair_3_0/firings_true.mda"
        },
        {
            recordingPath: "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth",
            sortingPath: "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth/firings_true.mda"
        }
    ].filter(ep => (ep.recordingPath === recordingPath));

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
                    examplePaths.map((ep, ii) => (
                        <MenuItem key={ii} value={ep.sortingPath}>{ep.sortingPath}</MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    )
}

const SortingPathControl = ({ value, onChange, errors, examplesMode, recordingPath }) => {
    const [internalValue, setInternalValue] = useState(value);

    const e = errors.sortingPath || {};
    return (
        <div>
            {
                examplesMode && (
                    <SelectExampleSortingPath
                        value={internalValue}
                        onChange={path => {
                            setInternalValue(path);
                            onChange(path);
                        }}
                        recordingPath={recordingPath}
                    />
                )
            }
            <FormGroup style={formGroupStyle}>
                <FormControl style={{visibility: examplesMode ? "hidden" : "visible"}}>
                    <InputLabel>Sorting path</InputLabel>
                    <Input
                        name="sortingPath"
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

const SortingLabelControl = ({ value, onChange, errors }) => {
    const e = errors.sortingLabel || {};
    return (
        <FormGroup style={formGroupStyle}>
            <FormControl>
                <InputLabel>Sorting Label</InputLabel>
                <Input
                    name="sortingLabel"
                    readOnly={false}
                    disabled={false}
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


const mapStateToProps = state => ({
    recordings: state.recordings,
    documentId: state.documentInfo.documentId,
    feedId: state.documentInfo.feedId
})

const mapDispatchToProps = dispatch => ({
    onAddSorting: (sorting) => dispatch(addSorting(sorting))
})

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(ImportSortings))
