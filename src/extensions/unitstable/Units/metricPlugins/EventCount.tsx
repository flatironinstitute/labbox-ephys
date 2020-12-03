import React from 'react';
import { MetricPlugin } from './common';

const EventCount = React.memo((a: {record: {count: number}}) => {
    return (
        <span>{a.record.count}</span>
    );
});

const getRecordValue = (record: any) => {
    return { 
        numericValue: record?.count ?? NaN, 
        stringValue: '',
        isNumeric: true
    }
}


const plugin: MetricPlugin = {
    type: 'metricPlugin',
    metricName: 'EventCount',
    columnLabel: 'Num. events',
    tooltip: 'Number of firing events',
    hitherFnName: 'createjob_get_firing_data',
    metricFnParams: {},
    hitherConfig: {
        wait: true,
        useClientCache: true,
        newHitherJobMethod: true
    },
    component: EventCount,
    getRecordValue: getRecordValue,
    development: false
}

export default plugin