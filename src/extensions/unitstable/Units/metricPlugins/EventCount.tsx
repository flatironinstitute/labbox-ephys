import React, { FunctionComponent } from 'react';
import { SortingUnitMetricPlugin } from '../../../../extension';

const EventCount: FunctionComponent<{record: any}> = ({record}) => {
    return (
        <span>{record.count}</span>
    );
}

const getRecordValue = (record: any) => {
    return { 
        numericValue: Number(record?.count ?? NaN), 
        stringValue: '',
        isNumeric: true
    }
}

const plugin: SortingUnitMetricPlugin = {
    name: 'EventCount',
    label: 'Num. events',
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
}

export default plugin