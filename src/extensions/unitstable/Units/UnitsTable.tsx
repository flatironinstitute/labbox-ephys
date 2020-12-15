import { Checkbox, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { ExternalSortingUnitMetric, Sorting, SortingSelection, SortingSelectionDispatch, SortingUnitMetricPlugin } from '../../extensionInterface';
import sortByPriority from '../../sortByPriority';
import { sortMetricValues } from './metricPlugins/common';

const getLabelsForUnitId = (unitId: number, sorting: Sorting) => {
    const labelsByUnit = (sorting.curation || {}).labelsByUnit || {};
    return labelsByUnit[unitId] || []
}

const HeaderRow = React.memo((a: {sortingUnitMetricsList: SortingUnitMetricPlugin[], externalUnitMetrics: ExternalSortingUnitMetric[], clearSorts: () => void, handleClick: (metricName: string) => void}) => {
    return (
        <TableHead>
            <TableRow>
                <TableCell key="_first" style={{ width: 0}} />
                <TableCell key="_unitIds" onClick={() => a.clearSorts()}><span>Unit ID</span></TableCell>
                <TableCell key="_labels"><span>Labels</span></TableCell>
                {
                    a.externalUnitMetrics.map(m => (
                        <TableCell key={m.name + '_external_header'}>
                            <span title={m.label}>{m.label}</span>
                        </TableCell>
                    ))
                }
                {
                    a.sortingUnitMetricsList.map(m => {
                        return (
                            <TableCell key={m.name + '_header'} onClick={() => a.handleClick(m.name)}>
                                <span title={m.tooltip}>{m.columnLabel}</span>
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

const UnitIdCell = React.memo((a: {id: string, sortingId: string}) => {
    // const elmt = (
    //     <Link to={`/${a.documentId}/sortingUnit/${a.sortingId}/${a.id}/${getPathQuery({feedUri: a.feedUri})}`}>
    //         {a.id}
    //     </Link>
    // )
    const elmt = a.id
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
    sortingUnitMetrics?: {[key: string]: SortingUnitMetricPlugin}
    units: number[]
    metrics?: {[key: string]: {data: {[key: string]: any}, error: string | null}}
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    sorting: Sorting
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
    const { sortingUnitMetrics, units, metrics, selection, selectionDispatch, sorting } = props
    const sortingUnitMetricsList = sortByPriority(Object.values(sortingUnitMetrics || {})).filter(p => (!p.disabled))
    const [sortFieldOrder, setSortFieldOrder] = useState<string[]>([])
    units.sort((a, b) => a - b) // first sort by actual unit number
    // Now sort the list iteratively by each of the sorters in the sortFieldOrder state.

    const toggleSelectedUnitId = useCallback(
        (unitId: number) => {
            const newSelectedUnitIds = (selection.selectedUnitIds.includes(unitId)) ?
                (selection.selectedUnitIds.filter(uid => (uid !== unitId))) :
                ([...selection.selectedUnitIds, unitId])
            selectionDispatch({type: 'SetSelectedUnitIds', selectedUnitIds: newSelectedUnitIds})
        },
        [selection, selectionDispatch]
    )

    const sortingRules = interpretSortFields(sortFieldOrder)
    for (const r of sortingRules) {
        const metricName = r.metricName
        const metric = (metrics || {})[metricName]
        if (!metric || !metric.data || metric['error']) continue // no data, nothing to do
        const getRecordForMetric = sortingUnitMetricsList.filter(mp => mp.name === metricName)[0].getRecordValue
        units.sort((a, b) => {
            const recordA = getRecordForMetric(metric.data[a + ''])
            const recordB = getRecordForMetric(metric.data[b + ''])
            return sortMetricValues(recordA, recordB, r.sortAscending)
        })
    }
    const selectedUnitIdsLookup: {[key: string]: boolean} = selection.selectedUnitIds.reduce((m, uid) => {m[uid + ''] = true; return m}, {} as {[key: string]: boolean})
    return (
        <Table className="NiceTable">
            <HeaderRow 
                externalUnitMetrics={sorting.externalUnitMetrics || []}
                sortingUnitMetricsList={sortingUnitMetricsList}
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
                                selected = {selectedUnitIdsLookup[unitId + ''] || false}
                                handleClicked = {() => toggleSelectedUnitId(unitId)}
                            />
                            <UnitIdCell
                                id = {unitId + ''}
                                // documentId = {documentInfo.documentId || 'default'}
                                sortingId = {sorting.sortingId}
                                // feedUri = {documentInfo.feedUri || ''}
                            />
                            <UnitLabelCell
                                labels = {getLabelsForUnitId(unitId, sorting).join(', ')}
                            />
                            {
                                (sorting.externalUnitMetrics || []).map(m => {
                                    return (
                                        <MetricCell
                                            title={m.tooltip || ''}
                                            key = {m.name + '_' + unitId}
                                            data = {m.data[unitId + ''] || NaN}
                                            error = {''}
                                            PayloadComponent = {(a: {record: number}) => {
                                                return (
                                                    <span>{a.record}</span>
                                                );
                                            }}
                                        />
                                    );
                                })
                            }
                            {
                                sortingUnitMetricsList.map(mp => {
                                    const metricName = mp.name
                                    const metric = (metrics || {})[metricName] || null
                                    const d = (metric && metric.data) ? (
                                        (unitId + '' in metric.data) ? metric.data[unitId + ''] : NaN
                                    ) : NaN
                                    return (
                                        <MetricCell
                                            title={mp.tooltip}
                                            key = {metricName + '_' + unitId}
                                            data = {d}
                                            error = {(metric || {})['error'] || ''}
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