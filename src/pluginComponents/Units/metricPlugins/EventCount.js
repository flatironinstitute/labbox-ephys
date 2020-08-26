import React from 'react';
import { LinearProgress } from '@material-ui/core';

const EventCount = React.memo(({record}) => {
    const ready = !record || !record.count || isNaN(record.count);
    return (
        ready
            ? <span>{record.count}</span>
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

const metricName = 'EventCount';

EventCount.metricPlugin = {
    metricName: metricName,
    columnLabel: 'Num. events',
    hitherFnName: 'get_firing_data',
    hitherConfig: hitherConfig
}

export default EventCount;