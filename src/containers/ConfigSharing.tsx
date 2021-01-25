import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { WorkspaceInfo } from '../AppContainer';
import { RootAction, RootState } from '../reducers';
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b

interface StateProps {
=======
import { WorkspaceInfo } from '../reducers/workspaceInfo';

interface StateProps {
    workspaceInfo: WorkspaceInfo
>>>>>>> import recordings view python scripts
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
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
    workspaceInfo: state.workspaceInfo,
>>>>>>> import recordings view python scripts
    defaultFeedId: state.serverInfo?.defaultFeedId || ''
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ConfigSharing)