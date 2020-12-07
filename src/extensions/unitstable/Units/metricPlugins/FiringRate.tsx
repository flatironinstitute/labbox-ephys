import React from 'react';
import { SortingUnitMetricPlugin } from '../../../extensionInterface';

const FiringRate = React.memo((a: {record: {rate: number}}) => {
    return (
        <span>{a.record.rate}</span>
    );
})

const getRecordValue = (record: any) => {
    return { 
        numericValue: record?.rate ?? NaN, 
        stringValue: '',
        isNumeric: true
    }
}

const plugin: SortingUnitMetricPlugin = {
    name: 'FiringRate',
    label: 'Firing rate (Hz)',
    columnLabel: 'Firing rate (Hz)',
    tooltip: 'Average events per second',
    hitherFnName: 'get_firing_data',
    metricFnParams: {},
    hitherConfig: {
        auto_substitute_file_objects: true,
        wait: true,
        useClientCache: true,
        hither_config: {
            use_job_cache: true
        },
        job_handler_name: 'partition3'
    },
    component: FiringRate,
    getRecordValue: getRecordValue
}

export default plugin