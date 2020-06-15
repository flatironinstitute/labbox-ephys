import React, { useState } from 'react'
import { connect } from 'react-redux'
import { addRecording } from '../actions'
import { withRouter } from 'react-router-dom';
import RadioChoices from '../components/RadioChoices';
import ImportRecordingFromLocalDisk from '../components/ImportRecordingFromLocalDisk';
import ImportRecordingFromFrankLabDataJoint from '../extensions/frankLabDataJoint/components/ImportRecordingFromFrankLabDataJoint';
import ImportRecordingFromSpikeForest from '../components/ImportRecordingFromSpikeForest';

const ImportRecordings = ({ onAddRecording, history, extensionsConfig, documentId }) => {
    const [method, setMethod] = useState('');

    const handleDone = () => {
        history.push(`/${documentId}`);
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
                frankLabDataJointConfig={extensionsConfig.frankLabDataJoint}
                onAddRecording={onAddRecording}
                onDone={handleDone}
            />
        )
    }
    else {
        form = <span>{`Select method.`}</span>
    }
    let options = [
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
        }
    ];
    if (extensionsConfig.enabled.frankLabDataJoint) {
        options.push({
            value: 'frankLabDataJoint',
            label: 'From FrankLab DataJoint'
        })
    }
    return (
        <div>
            <div>
                <RadioChoices
                    label="Recording import method"
                    value={method}
                    onSetValue={setMethod}
                    options={options}
                />
            </div>
            {form}
        </div>
    )
}

const mapStateToProps = state => ({
    extensionsConfig: state.extensionsConfig,
    documentId: state.documentInfo.documentId
})

const mapDispatchToProps = dispatch => ({
    onAddRecording: (recording) => dispatch(addRecording(recording))
})

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(ImportRecordings))
