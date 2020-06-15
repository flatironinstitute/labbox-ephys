import React from 'react';
import './Home.css';
import { Typography, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import RecordingsTable from '../containers/RecordingsTable';
import { connect } from 'react-redux';

function Home({ documentId }) {
  return (
    <div>
      <Typography component="p">
        Analysis and visualization of neurophysiology recordings and spike sorting results.
      </Typography>
      <p />
      <div>
        <Button component={Link} to={`/${documentId}/importRecordings`}>Import recordings</Button>
      </div>
      <RecordingsTable />
    </div>
  );
}

const mapStateToProps = state => ({
  documentId: state.documentInfo.documentId
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home)
