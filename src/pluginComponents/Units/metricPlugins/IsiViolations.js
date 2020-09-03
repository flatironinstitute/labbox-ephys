import React from 'react';

const IsiViolations = React.memo(({record = {}}) => {
    return (
        <span>{record.toFixed(4)}</span>
    );
});

IsiViolations.metricName = 'IsiViolations';
IsiViolations.columnLabel = 'ISI viol.';
IsiViolations.tooltip = 'ISI violation rate';
IsiViolations.hitherFnName = 'createjob_get_isi_violation_rates';
IsiViolations.metricFnParams = {
    'isi_threshold_msec': 2.5
    // need to sort out how to pass unit ids list?
};
IsiViolations.hitherConfig = {
    auto_substitute_file_objects: true,
    wait: true,
    newHitherJobMethod: true,
    useClientCache: true
}

IsiViolations.metricPlugin = {
    development: false
}

export default IsiViolations;