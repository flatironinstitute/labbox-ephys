import React from 'react';
import { SortingUnitMetricPlugin } from '../../../../extension';

const UnitSnrs = React.memo((a: {record: number}) => {
    return (
        <span>{a.record.toFixed(4)}</span>
    );
})

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
    component: UnitSnrs
}

export default plugin