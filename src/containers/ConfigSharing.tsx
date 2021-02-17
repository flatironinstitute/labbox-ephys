import { LabboxProviderContext, WorkspaceInfo } from 'labbox';
import React, { FunctionComponent, useContext } from 'react';

type Props = {
    workspaceInfo: WorkspaceInfo | null
}

const ConfigSharing: FunctionComponent<Props> = ({ workspaceInfo }) => {
    const {feedUri, workspaceName} = workspaceInfo || { feedUri: '', workspaceName: '' };
    const {serverInfo} = useContext(LabboxProviderContext)
    if (!serverInfo) return <div>No server info</div>
    const resolvedFeedUri = feedUri || 'feed://' + serverInfo.defaultFeedId;
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

export default ConfigSharing