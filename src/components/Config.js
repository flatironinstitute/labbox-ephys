import React from 'react';
import ComputeResourcesTable from '../containers/ComputeResourcesTable';
import DatabaseConfig from '../containers/DatabaseConfig';
import { Button } from '@material-ui/core';
import ConfigJobHandlers from '../containers/ConfigJobHandlers';

const Config = () => {
  return (
    <div>
      <ConfigJobHandlers />
      {/* <h1>Database configuration</h1>
      <DatabaseConfigWrapper />
      <h1>Compute resources configuration</h1>
      <div style={{ maxWidth: 800 }}>
        <ComputeResourcesTable />
      </div> */}
    </div>
  );
}

const DatabaseConfigWrapper = () => {
  const [ mode, setMode ] = React.useState('closed')

  if (mode === 'closed') {
    return <Button onClick={() => setMode('open')}>Edit database configuration</Button>
  }
  else if (mode === 'open') {
    return (
      <div style={{ maxWidth: 800 }}>
        <DatabaseConfig onDone={() => setMode('closed')} />
      </div>
    );
  }
  else {
    return <span>{`Unexpected mode: {mode}`}</span>
  }
}

export default Config;
