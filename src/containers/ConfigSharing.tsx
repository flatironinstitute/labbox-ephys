import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RootAction, RootState } from '../reducers';
import { WorkspaceInfo } from '../reducers/workspaceInfo';

interface StateProps {
    workspaceInfo: WorkspaceInfo
    defaultFeedId: string | null
}

interface DispatchProps {
}

interface OwnProps {
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
    workspaceInfo: state.workspaceInfo,
    defaultFeedId: state.serverInfo?.defaultFeedId || ''
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ConfigSharing)