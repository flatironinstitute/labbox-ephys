import { LinearProgress, TableCell } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { ExternalSortingUnitMetric, Sorting, SortingSelection, SortingSelectionDispatch, SortingUnitMetricPlugin } from '../../extensionInterface';
import sortByPriority from '../../sortByPriority';
import '../unitstable.css';
import TableWidget, { Column, Row } from './TableWidget';

const getLabelsForUnitId = (unitId: number, sorting: Sorting) => {
    const labelsByUnit = (sorting.curation || {}).labelsByUnit || {};
    return labelsByUnit[unitId] || []
}

const UnitIdCell = React.memo((props: {id: number, mergeGroup: number[] | null, sortingId: string}) => {
    const g = props.mergeGroup
    return <TableCell><span>{props.id + ''}{g && ' (' + [...g].sort().join(', ') + ')'}</span></TableCell>
})

const UnitLabelCell = React.memo((props: {labels: string}) => (
    <TableCell><span>{props.labels}</span></TableCell>
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

const UnitsTable: FunctionComponent<Props> = (props) => {
    const { sortingUnitMetrics, units, metrics, selection, selectionDispatch, sorting } = props
    const selectedUnitIds = ((selection || {}).selectedUnitIds || [])
    const sortingUnitMetricsList = sortByPriority(Object.values(sortingUnitMetrics || {})).filter(p => (!p.disabled))
    const [sortFieldOrder, setSortFieldOrder] = useState<string[]>([])

    const mergeGroupForUnitId = (unitId: number) => {
        const mergeGroups = (sorting.curation || {}).mergeGroups || []
        return mergeGroups.filter(g => (g.includes(unitId)))[0] || null
    }

    const handleSelectedRowIdsChanged = useCallback((selectedRowIds: string[]) => {
        selectionDispatch({
            type: 'SetSelectedUnitIds',
            selectedUnitIds: selectedRowIds.map(id => Number(id))
        })
    }, [ selectionDispatch ])

    const rows: Row[] = units.map(unitId => ({
        rowId: unitId + '',
        data: {}
    }))

    const numericSort = (a: any, b: any) => {
        return (Number(a) - Number(b))
    }
    const numericElement = (x: any) => (<span>{x + ''}</span>)

    const columns: Column[] = []
    
    // first column
    columns.push({
        columnName: '_unit_id',
        label: 'Unit ID',
        tooltip: 'Unit ID',
        sort: numericSort,
        dataElement: numericElement
    })
    rows.forEach(row => {
        const unitId = Number(row.rowId)
        row.data['_unit_id'] = {
            value: unitId,
            sortValue: unitId
        }
    })

    ;(sorting.externalUnitMetrics || []).forEach((m: ExternalSortingUnitMetric) => {
        const columnName = 'external-metric-' + m.name
        columns.push({
            columnName,
            label: m.label,
            tooltip: m.tooltip || '',
            sort: numericSort,
            dataElement: numericElement
        })
        rows.forEach(row => {
            const unitId = Number(row.rowId)
            row.data[columnName] = {
                value: m.data[unitId + ''],
                sortValue: m.data[unitId + '']
            }
        })
    })

    const selectedRowIds = selectedUnitIds.map(unitId => (unitId + ''))
   
    return (
        <TableWidget
            rows={rows}
            columns={columns}
            selectedRowIds={selectedRowIds}
            onSelectedRowIdsChanged={handleSelectedRowIdsChanged}
        />
    )
}

export default UnitsTable