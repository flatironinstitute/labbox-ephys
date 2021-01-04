import React, { Dispatch, FunctionComponent, useContext, useState } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { addRecording } from '../actions';
import ImportRecordingFromSpikeForest from '../components/ImportRecordingFromSpikeForest';
import RadioChoices from '../components/RadioChoices';
import HitherContext from '../extensions/common/HitherContext';
import { ExtensionsConfig } from '../extensions/reducers';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { DocumentInfo } from '../reducers/documentInfo';
import { Recording } from '../reducers/recordings';

interface StateProps {
    extensionsConfig: ExtensionsConfig
    documentInfo: DocumentInfo
}

interface DispatchProps {
    onAddRecording: (recording: Recording) => void
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

const ImportRecordings: FunctionComponent<Props> = ({ onAddRecording, history, extensionsConfig, documentInfo }) => {
    const hither = useContext(HitherContext)
    
    const { documentId, feedUri, readOnly } = documentInfo;

    const [method, setMethod] = useState('');

    const handleDone = () => {
        history.push(`/${documentId}${getPathQuery({feedUri})}`);
    }

    let form;
    if (method === 'spikeforest') {
        form = (
            <ImportRecordingFromSpikeForest
                onAddRecording={onAddRecording}
                onDone={handleDone}
                examplesMode={false}
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
    else {
        form = <span>{`Select method.`}</span>
    }
    let options = [
        {
            value: 'examples',
            label: 'Examples'
        },
        {
            value: 'spikeforest',
            label: 'From SpikeForest'
        }
    ];
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

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    extensionsConfig: state.extensionsConfig,
    documentInfo: state.documentInfo
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    onAddRecording: (recording: Recording) => {dispatch(addRecording(recording))}
})

export default withRouter(connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ImportRecordings))