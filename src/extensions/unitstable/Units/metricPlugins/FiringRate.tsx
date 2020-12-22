import React from 'react';
import { SortingUnitMetricPlugin } from '../../../extensionInterface';

const FiringRate = (record: any) => {
    return (
        <span>{record !== undefined ? record.rate : ''}</span>
    );
}

const plugin: SortingUnitMetricPlugin = {
    name: 'FiringRate',
    label: 'Firing rate (Hz)',
    columnLabel: 'Firing rate (Hz)',
    tooltip: 'Average num. events per second',
    hitherFnName: 'createjob_get_firing_data',
    metricFnParams: {},
    hitherConfig: {
        wait: true,
        useClientCache: true,
        newHitherJobMethod: true
    },
    component: FiringRate,
    isNumeric: true,
    getValue: (record: any) => record.count
}

export default plugin