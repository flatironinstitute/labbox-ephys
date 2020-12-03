import { Checkbox, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { FunctionComponent, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPathQuery } from '../../../kachery';
import { DocumentInfo } from '../../../reducers/documentInfo';
import { Sorting } from '../../../reducers/sortings';
import { MetricPlugin, sortMetricValues } from './metricPlugins/common';

const getLabelsForUnitId = (unitId: number, sorting: Sorting) => {
    const unitCuration = sorting.unitCuration || {};
    return (unitCuration[unitId] || {}).labels || [];
}

const HeaderRow = React.memo((a: {plugins: MetricPlugin[], clearSorts: () => void, handleClick: (metricName: string) => void}) => {
    return (
        <TableHead>
            <TableRow>
                <TableCell key="_first" style={{ width: 0}} />
                <TableCell key="_unitIds" onClick={() => a.clearSorts()}><span>Unit ID</span></TableCell>
                <TableCell key="_labels"><span>Labels</span></TableCell>
                {
                    a.plugins.map(plugin => {
                        return (
                            <TableCell key={plugin.columnLabel + '_header'}
                                        onClick={() => a.handleClick(plugin.metricName)}>
                                <span title={plugin.tooltip}>{plugin.columnLabel}</span>
                            </TableCell>
                        );
                    })
                }
            </TableRow>
        </TableHead>
    );
});

const UnitCheckbox = React.memo((a: {unitKey: string, selected: boolean, handleClicked: (unitId: number) => void}) => {
    return (
        <TableCell>
            <Checkbox
                checked={a.selected}
                onClick={() => a.handleClicked(Number(a.unitKey))}
            />
        </TableCell>
    );
});

const UnitIdCell = React.memo((a: {id: string, documentId: string, sortingId: string, feedUri: string}) => {
    const elmt = (
        <Link to={`/${a.documentId}/sortingUnit/${a.sortingId}/${a.id}/${getPathQuery({feedUri: a.feedUri})}`}>
            {a.id}
        </Link>
    )
    return <TableCell><span>{elmt}</span></TableCell>
})

const UnitLabelCell = React.memo((a: {labels: string}) => (
    <TableCell><span>{a.labels}</span></TableCell>
));

const MetricCell = React.memo((a: {title?: string, error: string, data: any, PayloadComponent: React.ComponentType<{record: any}>}) => {
    const { error, data, PayloadComponent } = a
    if (error !== '') {
        return (<TableCell><span>{`Error: ${error}`}</span></TableCell>);
    }
    if (data === null || data === '') { // 0 is a valid value!!
        return (<TableCell><LinearProgress style={{'width': '60%'}}/></TableCell>);
    } else {
        return (
            <TableCell>
                <span title={a.title}>
                    <PayloadComponent record = {data} />
                </span>
            </TableCell>
        );
    }
});


interface Props {
    metricPlugins: MetricPlugin[]
    units: number[]
    metrics: {[key: string]: {data: {[key: string]: any}, error: string | null}}
    selectedUnitIds: {[key: string]: boolean}
    sorting: Sorting
    onSelectedUnitIdsChanged: (s: {[key: string]: boolean}) => void
    documentInfo: DocumentInfo
}

const toggleSelectedUnitId = (selectedUnitIds: {[key: string]: boolean}, unitId: number): {[key: string]: boolean} => {
    return {
        ...selectedUnitIds,
        [unitId + '']: !(selectedUnitIds[unitId + ''] || false)
    }
}

type sortFieldEntry = {metricName: string, keyOrder: number, sortAscending: boolean}
const interpretSortFields = (fields: string[]): sortFieldEntry[] => {
    const result: sortFieldEntry[] = []
    for (let i = 0; i < fields.length; i ++) {
        // We are ascending unless two fields in a row are the same
        const sortAscending = (fields[i - 1] !== fields[i])
        result.push({metricName: fields[i], keyOrder: i, sortAscending})
    }
    return result
}

const UnitsTable: FunctionComponent<Props> = (props) => {
    const { metricPlugins, units, metrics, selectedUnitIds, sorting, onSelectedUnitIdsChanged, documentInfo } = props
    const [sortFieldOrder, setSortFieldOrder] = useState<string[]>([])
    units.sort((a, b) => a - b) // first sort by actual unit number
    // Now sort the list iteratively by each of the sorters in the sortFieldOrder state.

    const sortingRules = interpretSortFields(sortFieldOrder)
    for (const r of sortingRules) {
        const metricName = r.metricName
        const metric = metrics[metricName]
        console.log(`Now sorting by ${metricName}`)
        if (!metric || !metric.data || metric['error']) continue // no data, nothing to do
//        const comparer = metricPlugins.filter(mp => mp.metricName === metricName)[0].comparer(metric.data)
//        if (!comparer) continue // should not happen
        const getRecordForMetric = metricPlugins.filter(mp => mp.metricName === metricName)[0].getRecordValue
        units.sort((a, b) => {
            const recordA = getRecordForMetric(metric.data[a + ''])
            const recordB = getRecordForMetric(metric.data[b + ''])
            return sortMetricValues(recordA, recordB, r.sortAscending)
        })
        console.log(`Units now sorted to ${JSON.stringify(units)}`)
    }

    return (
        <Table className="NiceTable">
            <HeaderRow 
                plugins={metricPlugins}
                handleClick={(metricName: string) => {
                    let newSortFieldOrder = [...sortFieldOrder]
                    if (sortFieldOrder[sortFieldOrder.length - 1] === metricName) {
                        if (sortFieldOrder[sortFieldOrder.length - 2] === metricName) {
                            // the last two match this metric, let's just remove the last one
                            newSortFieldOrder = newSortFieldOrder.slice(0, newSortFieldOrder.length - 1)
                        }
                        else {
                            // the last one matches this metric, let's add another one
                            newSortFieldOrder = [...newSortFieldOrder, metricName]
                        }
                    }
                    else {
                        // the last one does not match this metric, let's clear out all previous instances and add one
                        newSortFieldOrder = [...newSortFieldOrder.filter(m => (m !== metricName)), metricName]
                    }
                    console.log(`Got click on field with metric ${metricName}, new order ${JSON.stringify(newSortFieldOrder)}`)
                    setSortFieldOrder(newSortFieldOrder)
                }}
                clearSorts={() => {
                    console.log('Clearing sorting')
                    setSortFieldOrder([])
                }}
            />
            <TableBody>
                {
                    units.map((unitId) => (
                        <TableRow key={unitId + '_row'}>
                            <UnitCheckbox
                                unitKey = {unitId + ''}
                                selected = {selectedUnitIds[unitId] || false}
                                handleClicked = {() => onSelectedUnitIdsChanged(toggleSelectedUnitId(selectedUnitIds, unitId))}
                            />
                            <UnitIdCell
                                id = {unitId + ''}
                                documentId = {documentInfo.documentId || 'default'}
                                sortingId = {sorting.sortingId}
                                feedUri = {documentInfo.feedUri || ''}
                            />
                            <UnitLabelCell
                                labels = {getLabelsForUnitId(unitId, sorting).join(', ')}
                            />
                            {
                                metricPlugins.map(mp => {
                                    const metricName = mp.metricName
                                    const metric = metrics?.[metricName]
                                    const d = metric?.data?.[unitId + ''] ?? NaN
                                    return (
                                        <MetricCell
                                            title={mp.tooltip}
                                            key = {metricName + '_' + unitId}
                                            data = {d}
                                            error = {metric['error'] || ''}
                                            PayloadComponent = {mp.component}
                                        />
                                    );
                                })
                            }
                        </TableRow>       
                    ))
                }
            </TableBody>
        </Table>
    );
}

export default UnitsTable