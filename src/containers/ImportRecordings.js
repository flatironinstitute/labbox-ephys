import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Input, FormGroup, FormControl, InputLabel, Button, CircularProgress, TableRow } from '@material-ui/core'
import { useForm } from 'react-hook-form'
import { fetchRecordingInfo } from '../actions'
import ElectrodeGeometryWidget from '../components/ElectrodeGeometryWidget'
import { Table, TableHead, TableBody, TableCell } from '@material-ui/core';

const ImportRecordings = ({ onDone, recordingInfoByPath, onFetchRecordingInfo }) => {
    const { register, handleSubmit, errors } = useForm();

    const onSubmit = (data) => {
        console.log(data);
        onDone && onDone();
    }

    const [recordingPath, setRecordingPath] = useState('');

    const recordingInfoObject = recordingInfoByPath[recordingPath];
    if ((recordingPath) && (!recordingInfoObject)) {
        setTimeout(function() {
            onFetchRecordingInfo(recordingPath);
        }, 0);
    }
    const showImportButton = (
        (recordingInfoObject) &&
        (!recordingInfoObject.fetching) &&
        (!recordingInfoObject.error)
    );

    return (
        <div>
            <h1>Import recording</h1>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <RecordingPathControl
                    inputRef={register({
                        required: true,
                        maxLength: null,
                        validate: null
                    })}
                    value={recordingPath}
                    onChange={(value) => { setRecordingPath(value) }}
                    errors={errors}
                />

                {
                    recordingInfoObject ? (
                        <RecordingInfoView
                            recordingPath={recordingPath}
                            recordingInfoObject={recordingInfoObject}
                        />
                    ) : <span />
                }

                <FormGroup row={true} style={formGroupStyle}>
                    {
                        showImportButton ? (
                            <Button variant="contained" type="submit">Import</Button>
                        ) : <span />
                    }
                </FormGroup>
            </form >
        </div>
    )
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

const RecordingInfoView = ({ recordingPath, recordingInfoObject }) => {
    const [selectedElectrodeIds, setSelectedElectrodeIds] = useState({});

    let x;
    if (recordingInfoObject.fetching) {
        x = <CircularProgress />;
    }
    else if (recordingInfoObject.error) {
        x = <span>Error loading recording info.</span>
    }
    else {
        const ri = recordingInfoObject.recordingInfo;
        x = (
            <div>
                <div style={{width: 600}}>
                    <RecordingViewTable
                        sampling_frequency={ri.sampling_frequency}
                        num_frames={ri.num_frames}
                        channel_ids={ri.channel_ids}
                        channel_groups={ri.channel_groups}
                    />
                </div>
                <ElectrodeGeometryWidget
                    locations={ri.geom}
                    selectedElectrodeIds={selectedElectrodeIds}
                    onSelectedElectrodeIdsChanged={(x) => setSelectedElectrodeIds(x)}
                />
            </div>
        );
    }
    console.log('--- recordingInfoObject', recordingInfoObject)
    return <div>
        <h3>{recordingPath}</h3>
        <div>{x}</div>
    </div>;
}

const RecordingViewTable = ({ sampling_frequency, channel_ids, channel_groups, num_frames }) => {
    return (
        <Table>
            <TableHead>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Sampling frequency</TableCell>
                    <TableCell>{sampling_frequency}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Num. frames</TableCell>
                    <TableCell>{num_frames}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Duration (min)</TableCell>
                    <TableCell>{num_frames / sampling_frequency / 60}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Channel IDs</TableCell>
                    <TableCell>{commasep(channel_ids)}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Channel groups</TableCell>
                    <TableCell>{commasep(channel_groups)}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}

function commasep(x) {
    if (!x) return JSON.stringify(x);
    return x.join(', ');
}

const RecordingPathControl = ({ inputRef, value, onChange, errors }) => {
    const [internalValue, setInternalValue] = useState(value);

    const e = errors.recordingPath || {};
    return (
        <FormGroup row={true} style={formGroupStyle}>
            <FormControl>
                <InputLabel>Recording path</InputLabel>
                <Input
                    name="recordingPath"
                    readOnly={false}
                    disabled={false}
                    value={internalValue}
                    onChange={(event) => { setInternalValue(event.target.value); }}
                    inputRef={inputRef}
                />
            </FormControl>
            {e.type === "required" && errorMessage(required)}
            {e.type === "maxLength" && errorMessage(maxLength)}
            {
                (internalValue !== value) ? (
                    <Button onClick={() => onChange(internalValue)}>Update</Button>
                ) : <span />
            }
        </FormGroup>
    );
}

const mapStateToProps = state => ({
    recordingInfoByPath: state.recordingInfoByPath
})

const mapDispatchToProps = dispatch => ({
    onFetchRecordingInfo: (recordingPath) => dispatch(fetchRecordingInfo(recordingPath))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImportRecordings)
