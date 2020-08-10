// import React from 'react'


// const HomeDBC = ({ documentId }) => {
//     return <div>Home page DBC:  {documentId}</div>;
// }

// export default HomeDBC;

import React from 'react';
import './Home.css';
import { Typography, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import RecordingsTableDBC from '../containers/RecordingsTableDBC';
import { connect } from 'react-redux';
import { getPathQuery } from '../kachery';

function HomeDBC({ documentInfo }) {
  const { documentId, feedUri, readonly } = documentInfo;
  return (
    <div>
      <Typography component="p">
        Analysis and visualization of neurophysiology recordings and spike sorting results (DBC).
      </Typography>
      <p />
      <div>
        <Button component={Link} to={`/${documentId}/importRecordings${getPathQuery({feedUri})}`}>Import recordings</Button>
      </div>
      <RecordingsTableDBC />
    </div>
  );
}

const mapStateToProps = state => ({
  documentInfo: state.documentInfo
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HomeDBC)
