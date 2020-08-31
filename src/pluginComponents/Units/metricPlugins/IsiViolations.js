import React from 'react';

const IsiViolations = React.memo(({record = {}}) => {
    return (
        <span>{record.toFixed(6)}</span>
    );
});

IsiViolations.metricName = 'IsiViolations';
IsiViolations.columnLabel = 'ISI Violation rate';
IsiViolations.hitherFnName = 'get_isi_violation_rates';
IsiViolations.metricFnParams = {
    'isi_threshold_msec': 2.5
    // need to sort out how to pass unit ids list?
};
IsiViolations.hitherConfig = {
    auto_substitute_file_objects: true,
    wait: true,
    useClientCache: true,
    hither_config: {
        use_job_cache: true
    },
    job_handler_name: 'partition3'
}

IsiViolations.metricPlugin = {
    development: false
}

export default IsiViolations;