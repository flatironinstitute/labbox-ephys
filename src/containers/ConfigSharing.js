import React from 'react'
import { connect } from 'react-redux';

const ConfigSharing = ({
    documentInfo
}) => {
    const {feedUri, documentId} = documentInfo;
    return (
        <div>
            <h1>Sharing</h1>
            <p>You can share the following information:</p>
            <pre>{`Feed URI: ${feedUri}`}</pre>
            <pre>{`document ID: ${documentId}`}</pre>
            {
                feedUri && (
                    <pre>
                        {`.../${documentId}?feed=${feedUri}`}
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
