import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Input, FormGroup, FormControl, InputLabel, Button, CircularProgress } from '@material-ui/core'
import { useForm } from 'react-hook-form'
import { fetchRecordingInfo } from '../actions'

const ImportRecordings = ({ onDone, recordingInfoByPath, onFetchRecordingInfo }) => {
    const { register, handleSubmit, errors } = useForm();

    const onSubmit = (data) => {
        console.log(data);
        onDone && onDone();
    }

    const onCancel = () => {
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
                        maxLength: 30,
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
const maxLength = "Your input exceed maximum length";

const errorMessage = error => {
    return <div className="invalid-feedback">{error}</div>;
};

const RecordingInfoView = ({ recordingPath, recordingInfoObject }) => {
    let x;
    if (recordingInfoObject.fetching) {
        x = <CircularProgress />;
    }
    else if (recordingInfoObject.error) {
        x = <span>Error loading recording info.</span>
    }
    else {
        x = <pre>{JSON.stringify(recordingInfoObject.recordingInfo)}</pre>
    }
    console.log('--- recordingInfoObject', recordingInfoObject)
    return <div>
        <h3>{recordingPath}</h3>
        <div>{x}</div>
    </div>;
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
