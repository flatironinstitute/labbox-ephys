import React from 'react';
import './Home.css';
import { Typography, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <Typography component="p">
        Analysis and visualization of neurophysiology recordings and spike sorting results.
      </Typography>
      <p />
      <div>
        <Button component={Link} to="/importRecordings">Import recordings</Button>
      </div>
    </div>
  );
}

export default Home;
