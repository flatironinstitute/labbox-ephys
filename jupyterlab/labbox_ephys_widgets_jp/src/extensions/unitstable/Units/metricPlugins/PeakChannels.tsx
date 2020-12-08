import React from 'react';
import { SortingUnitMetricPlugin } from '../../../extensionInterface';

const PeakChannels = React.memo((a: {record: number}) => {
    return (
        <span>{a.record}</span>
    );
})

const getRecordValue = (record: any) => {
    return { 
        numericValue: ((record) || (record === 0)) ? record as number : NaN, 
        stringValue: '',
        isNumeric: true
    }
}

const plugin: SortingUnitMetricPlugin = {
    name: 'PeakChannels',
    label: 'Peak chan.',
    columnLabel: 'Peak chan.',
    tooltip: 'ID of channel where the peak-to-peak amplitude is maximal',
    hitherFnName: 'createjob_get_peak_channels',
    metricFnParams: {},
    hitherConfig: {
        wait: true,
        newHitherJobMethod: true,
        useClientCache: true
    },
    component: PeakChannels,
    getRecordValue: getRecordValue
}

export default plugin