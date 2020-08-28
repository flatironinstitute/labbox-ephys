import React from 'react';

const FiringRate = React.memo(({record = {}}) => {
    return (
        <span>{record.rate}</span>
    );
});

FiringRate.metricName = 'FiringRate';
FiringRate.columnLabel = 'Firing rate (Hz)';
FiringRate.hitherFnName = 'get_firing_data';
FiringRate.metricFnParams = {};
FiringRate.hitherConfig = {
    auto_substitute_file_objects: true,
    wait: true,
    useClientCache: true,
    hither_config: {
        use_job_cache: true
    },
    job_handler_name: 'partition3'
}


FiringRate.metricPlugin = {
    development: false
}

export default FiringRate;