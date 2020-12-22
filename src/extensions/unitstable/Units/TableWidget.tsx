import { Checkbox, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useState } from 'react';
import '../unitstable.css';

export interface Row {
    rowId: string
    data: {[key: string]: {
        value: any,
        sortValue: any
    }}
}

export interface Column {
    columnName: string
    label: string
    tooltip: string
    sort: (a: any, b: any) => number
    dataElement: (d: any) => JSX.Element
}

const HeaderRow: FunctionComponent<{columns: Column[], onColumnClick: (column: Column) => void}> = (props) => {
    const { columns, onColumnClick } = props
    return (
        <TableHead>
            <TableRow>
                <TableCell key="_checkbox" />
                {
                    columns.map(column => {
                        return (
                            <TableCell key={column.columnName} onClick={() => onColumnClick(column)}>
                                <span title={column.tooltip || column.label}>{column.label}</span>
                            </TableCell>
                        )
                    })
                }
            </TableRow>
        </TableHead>
    )
}

const RowCheckbox = React.memo((props: {rowId: string, selected: boolean, onClick: (rowId: string) => void}) => {
    const { rowId, selected, onClick } = props
    return (
        <Checkbox
            checked={selected}
            onClick={() => onClick(rowId)}
        />
    );
});

interface Props {
    selectedRowIds: string[]
    onSelectedRowIdsChanged: (x: string[]) => void
    rows: Row[]
    columns: Column[]
}

type sortFieldEntry = {columnName: string, keyOrder: number, sortAscending: boolean}
const interpretSortFields = (fields: string[]): sortFieldEntry[] => {
    const result: sortFieldEntry[] = []
    for (let i = 0; i < fields.length; i ++) {
        // We are ascending unless two fields in a row are the same
        const sortAscending = (fields[i - 1] !== fields[i])
        result.push({columnName: fields[i], keyOrder: i, sortAscending})
    }
    return result
}

const TableWidget: FunctionComponent<Props> = (props) => {

    const { selectedRowIds, onSelectedRowIdsChanged, rows, columns } = props

    const [sortFieldOrder, setSortFieldOrder] = useState<string[]>([])

    const toggleSelectedRowId = useCallback(
        (rowId: string) => {
            const newSelectedRowIds = selectedRowIds.includes(rowId) ? selectedRowIds.filter(x => (x !== rowId)) : [...selectedRowIds, rowId]
            onSelectedRowIdsChanged(newSelectedRowIds)
        },
        [selectedRowIds, onSelectedRowIdsChanged]
    )

    const sortedRows = [...rows]

    const columnForName = (columnName: string): Column => (columns.filter(c => (c.columnName === columnName))[0])

    const sortingRules = interpretSortFields(sortFieldOrder)
    for (const r of sortingRules) {
        const columnName = r.columnName
        const column = columnForName(columnName)
        sortedRows.sort((a, b) => {
            const dA = (a.data[columnName] || {})
            const dB = (b.data[columnName] || {})
            const valueA = dA.sortValue
            const valueB = dB.sortValue

            return column.sort(valueA, valueB)
        })
    }
    const selectedRowIdsLookup: {[key: string]: boolean} = (selectedRowIds || []).reduce((m, id) => {m[id] = true; return m}, {} as {[key: string]: boolean})
    
    return (
        <Table className="TableWidget">
            <HeaderRow
                columns={columns}
                onColumnClick={(column) => {
                    const columnName = column.columnName
                    let newSortFieldOrder = [...sortFieldOrder]
                    if (sortFieldOrder[sortFieldOrder.length - 1] === columnName) {
                        if (sortFieldOrder[sortFieldOrder.length - 2] === columnName) {
                            // the last two match this column, let's just remove the last one
                            newSortFieldOrder = newSortFieldOrder.slice(0, newSortFieldOrder.length - 1)
                        }
                        else {
                            // the last one matches this column, let's add another one
                            newSortFieldOrder = [...newSortFieldOrder, columnName]
                        }
                    }
                    else {
                        // the last one does not match this column, let's clear out all previous instances and add one
                        newSortFieldOrder = [...newSortFieldOrder.filter(m => (m !== columnName)), columnName]
                    }
                    setSortFieldOrder(newSortFieldOrder)
                }}
            />
            <TableBody>
                {
                    sortedRows.map((row) => (
                        <TableRow key={row.rowId}>
                            <TableCell key="_checkbox">
                                <RowCheckbox
                                    rowId={row.rowId}
                                    selected={selectedRowIdsLookup[row.rowId] || false}
                                    onClick = {() => toggleSelectedRowId(row.rowId)}
                                />
                            </TableCell>
                            {
                                columns.map(column => (
                                    <TableCell key={column.columnName}>
                                        <div title={column.tooltip}>
                                            {column.dataElement(row.data[column.columnName].value)}
                                        </div>
                                    </TableCell>
                                ))
                            }
                        </TableRow>       
                    ))
                }
            </TableBody>
        </Table>
    );
}

export default TableWidget