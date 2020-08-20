import React from 'react'
import { connect } from 'react-redux';

const ConfigSharing = ({
    documentInfo, defaultFeedId
}) => {
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


const mapStateToProps = state => ({
    documentInfo: state.documentInfo,
    defaultFeedId: state.serverInfo.defaultFeedId
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfigSharing)
