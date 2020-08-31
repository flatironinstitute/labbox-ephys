import React from 'react';
import RecordingsTable from '../../containers/RecordingsTable';
import { connect } from 'react-redux';
import Header from './components/Header'

const NewHome = ({ documentInfo }) => {
    return (
        <>
            <Header documentInfo={documentInfo} />
            <RecordingsTable />
        </>
    );
}

const mapStateToProps = state => ({
    documentInfo: state.documentInfo,
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewHome)
