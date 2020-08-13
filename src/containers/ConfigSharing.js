import React from 'react'
import { connect } from 'react-redux';

const ConfigSharing = ({
    documentInfo
}) => {
    const {feedUri, resolvedFeedUri, documentId} = documentInfo;
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
    documentInfo: state.documentInfo
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfigSharing)
