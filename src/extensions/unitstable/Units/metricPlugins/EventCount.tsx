import React from 'react';
import { SortingUnitMetricPlugin } from '../../../extensionInterface';

const EventCount = (record: any) => {
    return (
        <span>{record !== undefined ? record.count: ''}</span>
    );
}

const plugin: SortingUnitMetricPlugin = {
    name: 'EventCount',
    label: 'Num. events',
    columnLabel: 'Num. events',
    tooltip: 'Number of firing events',
    hitherFnName: 'createjob_get_firing_data',
    metricFnParams: {},
    hitherOpts: {
        useClientCache: true
    },
    component: EventCount,
    isNumeric: true,
    getValue: (record: any) => record.count
}

export default plugin