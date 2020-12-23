import React from 'react';
import { SortingUnitMetricPlugin } from '../../../extensionInterface';

const IsiViolations = (record: any) => {
    return (
        <span>{record !== undefined ? record.toFixed(4): ''}</span>
    );
}

const plugin: SortingUnitMetricPlugin = {
    name: 'IsiViolations',
    label: 'ISI viol.',
    columnLabel: 'ISI viol.',
    tooltip: 'ISI violation rate',
    hitherFnName: 'createjob_get_isi_violation_rates',
    metricFnParams: {
        'isi_threshold_msec': 2.5
        // need to sort out how to pass unit ids list?
    },
    hitherOpts: {
        useClientCache: true
    },
    component: IsiViolations,
    isNumeric: true,
    getValue: (record: any) => record
}

export default plugin