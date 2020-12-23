import { Button, CircularProgress, FormControl, FormControlLabel, FormGroup, FormLabel, Input, InputLabel, makeStyles, MenuItem, Radio, RadioGroup, Select } from '@material-ui/core';
import React, { Dispatch, Fragment, FunctionComponent, useEffect, useState } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { addSorting, sleep } from '../actions';
import SortingInfoView from '../components/SortingInfoView';
import { HitherContext } from '../extensions/extensionInterface';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { DocumentInfo } from '../reducers/documentInfo';
import { Recording } from '../reducers/recordings';
import { Sorting, SortingInfo } from '../reducers/sortings';

interface StateProps {
    recordings: Recording[],
    documentInfo: DocumentInfo,
    hither: HitherContext
}

interface DispatchProps {
    onAddSorting: (sorting: Sorting) => void
}

interface OwnProps {
    recordingId: string
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

const ImportSortings: FunctionComponent<Props> = ({ history, recordingId, recordings, documentInfo, onAddSorting, hither }) => {
    const { documentId, feedUri, readOnly } = documentInfo;
    const [method, setMethod] = useState('examples');

    const recording = recordings.filter(r => (r.recordingId === recordingId))[0];
    if (!recording) {
        return <div>{`Recording not found: ${recordingId}`}</div>;
    }
    const recordingPath = recording.recordingPath;
    const recordingObject = recording.recordingObject;

    const handleDone = () => {
        history.push(`/${documentId}/recording/${recordingId}${getPathQuery({feedUri})}`);
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
                hither={hither}
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
                hither={hither}
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
                <h1>{`Import sorting for ${recording.recordingLabel}`}</h1>
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

const RadioChoices: FunctionComponent<{ label: string, value: any, onSetValue: (value: any) => void, options: {label: string, value: any, disabled?: boolean}[] }> = ({ label, value, onSetValue, options }) => {
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

const ImportSortingFromSpikeForest: FunctionComponent<{ onDone: () => void, onAddSorting: (sorting: Sorting) => void, examplesMode: boolean, recordingId: string, recordingPath: string, recordingObject: any, hither: HitherContext }> = ({ onDone, onAddSorting, examplesMode, recordingId, recordingPath, recordingObject, hither }) => {
    const [sortingPath, setSortingPath] = useState('');
    const [sortingObject, setSortingObject] = useState<any | null>(null);
    const [sortingLabel, setSortingLabel] = useState('');
    const [errors, setErrors] = useState({});
    const [sortingInfo, setSortingInfo] = useState<SortingInfo | null>(null);
    const [sortingInfoStatus, setSortingInfoStatus] = useState<string | null>(null);

    const effect = async () => {
        if ((sortingPath) && (!sortingObject) && (!sortingInfo)) {
            setSortingInfoStatus('calculating');
            try {
                await sleep(500);
                const obj = await hither.createHitherJob(
                    'get_sorting_object',
                    {
                        sorting_path: sortingPath,
                        recording_object: recordingObject
                    },
                    {
                        useClientCache: false // todo: maybe this should be true?
                    }
                ).wait()
                setSortingObject(obj);
                const info = await hither.createHitherJob(
                    'get_sorting_info',
                    { sorting_object: obj, recording_object: recordingObject },
                    {
                        useClientCache: false // todo: maybe this should be true?
                    }
                ).wait() as SortingInfo
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
        let newErrors: {sortingLabel?: any, sortingPath?: any} = {};
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
                    onChange={(value: string) => setSortingPath(value)}
                    errors={errors}
                    recordingPath={recordingPath}
                />

                {sortingInfo && (
                    <Fragment>
                        <SortingLabelControl
                            value={sortingLabel}
                            onChange={(val: string) => setSortingLabel(val)}
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

function randomString(num_chars: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function autoDetermineSortingLabelFromPath(path: string) {
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

const errorMessage = (error: string) => {
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

const SelectExampleSortingPath: FunctionComponent<{ value: string, onChange: (val: string) => void, recordingPath: string }> = ({value, onChange, recordingPath}) => {
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
                onChange={evt => { onChange(evt.target.value as string) }}
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

const SortingPathControl: FunctionComponent<{ value: string, onChange: (v: string) => void, errors: {[key: string]: any}, examplesMode: boolean, recordingPath: string }> = ({ value, onChange, errors, examplesMode, recordingPath }) => {
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

const SortingLabelControl: FunctionComponent<{ value: string, onChange: (v: string) => void, errors: {[key: string]: any} }> = ({ value, onChange, errors }) => {
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

function isEmptyObject(x: {[key: string]: any}) {
    return Object.keys(x).length === 0;
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    recordings: state.recordings,
    documentInfo: state.documentInfo,
    hither: state.hitherContext
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    onAddSorting: (sorting: Sorting) => dispatch(addSorting(sorting))
})

export default withRouter(connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ImportSortings))