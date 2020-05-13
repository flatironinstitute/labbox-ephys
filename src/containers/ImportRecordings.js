import React, { useState } from 'react'
import { connect } from 'react-redux'
import { addRecording } from '../actions'
import { withRouter } from 'react-router-dom';
import RadioChoices from '../components/RadioChoices';
import ImportRecordingsFromLocalDisk from '../components/ImportRecordingFromLocalDisk';
import ImportRecordingFromSpikeForest from '../components/ImportRecordingFromSpikeForest';

const ImportRecordings = ({ existingRecordingIds, onAddRecording, history }) => {
    const [method, setMethod] = useState('local');

    const handleDone = () => {
        history.push('/');
    }

    let form;
    if (method === 'spikeforest') {
        form = (
            <ImportRecordingFromSpikeForest
                existingRecordingIds={existingRecordingIds}
                onAddRecording={onAddRecording}
                onDone={handleDone}
            />
        )
    }
    else if (method === 'examples') {
        form = (
            <ImportRecordingFromSpikeForest
                examplesMode={true}
                existingRecordingIds={existingRecordingIds}
                onAddRecording={onAddRecording}
                onDone={handleDone}
            />
        )
    }
    else if (method === 'local') {
        form = (
            <ImportRecordingsFromLocalDisk
                existingRecordingIds={existingRecordingIds}
                onAddRecording={onAddRecording}
                onDone={handleDone}
            />
        )
    }
    else {
        form = <span>{`Invalid method: ${method}`}</span>
    }
    return (
        <div>
            <div>
                <RadioChoices
                    label="Recording import method"
                    value={method}
                    onSetValue={setMethod}
                    options={[
                        {
                            value: 'local',
                            label: 'From local computer (in progress)'
                        },
                        {
                            value: 'examples',
                            label: 'Examples'
                        },
                        {
                            value: 'spikeforest',
                            label: 'From SpikeForest'
                        },
                        {
                            value: 'script',
                            label: 'From Python script (not yet implemented)',
                            disabled: true
                        }
                    ]}
                />
            </div>
            {form}
        </div>
    )
}

const mapStateToProps = state => ({
    existingRecordingIds: state.recordings.map(rec => rec.recordingId)
})

const mapDispatchToProps = dispatch => ({
    onAddRecording: (recording) => dispatch(addRecording(recording))
})

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(ImportRecordings))
