import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RootAction, RootState } from '../reducers';
import { DocumentInfo } from '../reducers/documentInfo';

interface StateProps {
    documentInfo: DocumentInfo
    defaultFeedId: string | null
}

interface DispatchProps {
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

const ConfigSharing: FunctionComponent<Props> = ({ documentInfo, defaultFeedId }) => {
    const {feedUri, documentId} = documentInfo;
    const resolvedFeedUri = feedUri || 'feed://' + defaultFeedId;
    return (
        <div>
            <h1>Sharing</h1>
            <p>You can share the following information:</p>
            <pre>{`Feed URI: ${resolvedFeedUri}`}</pre>
            <pre>{`document ID: ${documentId}`}</pre>
            {
                resolvedFeedUri && (
                    <pre>
                        {`.../${documentId}?feed=${resolvedFeedUri}`}
                    </pre>
                )
            }
        </div>
    )
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    documentInfo: state.documentInfo,
    defaultFeedId: state.serverInfo?.defaultFeedId || ''
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ConfigSharing)