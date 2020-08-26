import React from 'react';
import { LinearProgress } from '@material-ui/core';

// ERROR CHECKING & LINEARPRORGESS belongs in PARENT, we shouldn't care about it
const FiringRate = React.memo(({record = {}}) => {
    const ready = !record.rate || isNaN(record.rate);
    return (
        ready
            ? <span>{record.rate}</span>
            : <span><LinearProgress /></span>
    );
});

const hitherConfig = {
    auto_substitute_file_objects: true,
    wait: true,
    useClientCache: true,
    hither_config: {
        use_job_cache: true
    },
    job_handler_name: 'calculation'
}

const metricName = 'FiringRate';

FiringRate.metricPlugin = {
    metricName: metricName,
    columnLabel: 'Firing rate (Hz)',
    hitherFnName: 'get_firing_data',
    hitherConfig: hitherConfig
}

export default FiringRate;