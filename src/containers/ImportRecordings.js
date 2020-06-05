import React, { useState } from 'react'
import { connect } from 'react-redux'
import { addRecording } from '../actions'
import { withRouter } from 'react-router-dom';
import RadioChoices from '../components/RadioChoices';
import ImportRecordingFromLocalDisk from '../components/ImportRecordingFromLocalDisk';
import ImportRecordingFromFrankLabDataJoint from '../components/ImportRecordingFromFrankLabDataJoint';
import ImportRecordingFromSpikeForest from '../components/ImportRecordingFromSpikeForest';

const ImportRecordings = ({ onAddRecording, history, frankLabDataJointConfig }) => {
    const [method, setMethod] = useState('');

    const handleDone = () => {
        history.push('/');
    }

    let form;
    if (method === 'spikeforest') {
        form = (
            <ImportRecordingFromSpikeForest
                onAddRecording={onAddRecording}
                onDone={handleDone}
            />
        )
    }
    else if (method === 'examples') {
        form = (
            <ImportRecordingFromSpikeForest
                examplesMode={true}
                onAddRecording={onAddRecording}
                onDone={handleDone}
            />
        )
    }
    else if (method === 'local') {
        form = (
            <ImportRecordingFromLocalDisk
                onAddRecording={onAddRecording}
                onDone={handleDone}
            />
        )
    }
    else if (method === 'frankLabDataJoint') {
        form = (
            <ImportRecordingFromFrankLabDataJoint
                frankLabDataJointConfig={frankLabDataJointConfig}
                onAddRecording={onAddRecording}
                onDone={handleDone}
            />
        )
    }
    else {
        form = <span>{`Select method.`}</span>
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
                            label: 'From local disk'
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
                            value: 'frankLabDataJoint',
                            label: 'From FrankLab DataJoint'
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
    frankLabDataJointConfig: state.frankLabDataJointConfig
})

const mapDispatchToProps = dispatch => ({
    onAddRecording: (recording) => dispatch(addRecording(recording))
})

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(ImportRecordings))
