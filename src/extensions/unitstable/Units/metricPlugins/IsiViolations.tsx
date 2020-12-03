import React from 'react';
import { MetricPlugin } from './common';

const IsiViolations = React.memo((a: {record: number}) => {
    return (
        <span>{a.record.toFixed(4)}</span>
    );
})

const plugin: MetricPlugin = {
    type: 'metricPlugin',
    metricName: 'IsiViolations',
    columnLabel: 'ISI viol.',
    tooltip: 'ISI violation rate',
    hitherFnName: 'createjob_get_isi_violation_rates',
    metricFnParams: {
        'isi_threshold_msec': 2.5
        // need to sort out how to pass unit ids list?
    },
    hitherConfig: {
        auto_substitute_file_objects: true,
        wait: true,
        newHitherJobMethod: true,
        useClientCache: true
    },
    component: IsiViolations,
    development: false
}

export default plugin