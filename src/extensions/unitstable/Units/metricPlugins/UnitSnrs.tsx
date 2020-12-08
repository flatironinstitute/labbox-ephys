import React from 'react';
import { SortingUnitMetricPlugin } from '../../../extensionInterface';

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

const plugin: SortingUnitMetricPlugin = {
    name: 'UnitSnrs',
    label: 'SNR',
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
    getRecordValue: getRecordValue
}

export default plugin