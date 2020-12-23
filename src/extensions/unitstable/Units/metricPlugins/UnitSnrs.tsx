import React from 'react';
import { SortingUnitMetricPlugin } from '../../../extensionInterface';

const UnitSnrs = (record: any) => {
    return (
        <span>{record !== undefined ? record.toFixed(4) : ''}</span>
    );
}

const plugin: SortingUnitMetricPlugin = {
    name: 'UnitSnrs',
    label: 'SNR',
    columnLabel: 'SNR',
    tooltip: 'Unit SNR (peak-to-peak amp of mean waveform / est. std. dev on peak chan)',
    hitherFnName: 'createjob_get_unit_snrs',
    metricFnParams: {},
    hitherOpts: {
        useClientCache: true
    },
    component: UnitSnrs,
    isNumeric: true,
    getValue: (record: any) => record
}

export default plugin