import React, { useState, Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';

const DbcRecordingsView = ({ documentId }) => {
    return <div>Test: {documentId}</div>;
}

const mapStateToProps = state => ({
    documentId: state.documentInfo.documentId
})

const mapDispatchToProps = dispatch => ({
})

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(DbcRecordingsView))
