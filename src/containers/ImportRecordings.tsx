import React, { Dispatch, FunctionComponent, useState } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { addRecording } from '../actions';
import ImportRecordingFromSpikeForest from '../components/ImportRecordingFromSpikeForest';
import RadioChoices from '../components/RadioChoices';
import { HitherContext } from '../extensions/extensionInterface';
import { ExtensionsConfig } from '../extensions/reducers';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { DocumentInfo } from '../reducers/documentInfo';
import { Recording } from '../reducers/recordings';

interface StateProps {
    extensionsConfig: ExtensionsConfig
    documentInfo: DocumentInfo
    hither: HitherContext
}

interface DispatchProps {
    onAddRecording: (recording: Recording) => void
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

const ImportRecordings: FunctionComponent<Props> = ({ onAddRecording, history, extensionsConfig, documentInfo, hither }) => {
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
                hither={hither}
            />
        )
    }
    else if (method === 'examples') {
        form = (
            <ImportRecordingFromSpikeForest
                examplesMode={true}
                onAddRecording={onAddRecording}
                onDone={handleDone}
                hither={hither}
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
    documentInfo: state.documentInfo,
    hither: state.hitherContext
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    onAddRecording: (recording: Recording) => dispatch(addRecording(recording))
})

export default withRouter(connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ImportRecordings))