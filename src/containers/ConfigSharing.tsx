import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { WorkspaceInfo } from '../extensions/extensionInterface';
import { RootAction, RootState } from '../reducers';

interface StateProps {
    defaultFeedId: string | null
}

interface DispatchProps {
}

interface OwnProps {
    workspaceInfo: WorkspaceInfo
}

type Props = StateProps & DispatchProps & OwnProps

const ConfigSharing: FunctionComponent<Props> = ({ workspaceInfo, defaultFeedId }) => {
    const {feedUri, workspaceName} = workspaceInfo;
    const resolvedFeedUri = feedUri || 'feed://' + defaultFeedId;
    return (
        <div>
            <h1>Sharing</h1>
            <p>You can share the following information:</p>
            <pre>{`Feed URI: ${resolvedFeedUri}`}</pre>
            <pre>{`document ID: ${workspaceName}`}</pre>
            {
                resolvedFeedUri && (
                    <pre>
                        {`.../${workspaceName}?feed=${resolvedFeedUri}`}
                    </pre>
                )
            }
        </div>
    )
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    defaultFeedId: state.serverInfo?.defaultFeedId || ''
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ConfigSharing)