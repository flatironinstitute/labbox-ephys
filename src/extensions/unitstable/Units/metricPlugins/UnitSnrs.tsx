import React from 'react';
import { MetricPlugin } from './common';

const UnitSnrs = React.memo((a: {record: number}) => {
    return (
        <span>{a.record.toFixed(4)}</span>
    );
})

const getRecordValue = (record: any) => {
    return { 
        numericValue: record ? record as number : NaN, 
        stringValue: '',
        isNumeric: true
    }
}

const plugin: MetricPlugin = {
    type: 'metricPlugin',
    metricName: 'UnitSnrs',
    columnLabel: 'SNR',
    tooltip: 'Unit SNR (peak-to-peak amp of mean waveform / est. std. dev on peak chan)',
    hitherFnName: 'createjob_get_unit_snrs',
    metricFnParams: {},
    hitherConfig: {
        wait: true,
        newHitherJobMethod: true,
        useClientCache: true
    },
    component: UnitSnrs,
    getRecordValue: getRecordValue,
    development: false
}

export default plugin