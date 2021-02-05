import { Checkbox, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { Delete, Edit } from "@material-ui/icons";
import React, { FunctionComponent } from 'react';
import './NiceTable.css';

interface Row {
    key: string
    columnValues: {[key: string]: any}
}
interface Col {
    key: string
    label: string
}

interface Props {
    rows: Row[],
    columns: Col[],
    onDeleteRow?: ((key: string, columnValues: {[key: string]: any}) => void),
    deleteRowLabel?: string,
    onEditRow?: ((key: string, columnValues: {[key: string]: any}) => void),
    editRowLabel?: string,
    selectionMode?: 'none' | 'single' | 'multiple',
    selectedRowKeys?: {[key: string]: boolean},
    onSelectedRowKeysChanged?: ((keys: string[]) => void)
}

const NiceTable: FunctionComponent<Props> = ({
    rows,
    columns,
    onDeleteRow=undefined,
    deleteRowLabel=undefined,
    onEditRow=undefined,
    editRowLabel=undefined,
    selectionMode='none', // none, single, multiple
    selectedRowKeys={},
    onSelectedRowKeysChanged=undefined
}) => {
    const selectedRowKeysObj: {[key: string]: boolean} = {};
    Object.keys(selectedRowKeys).forEach((key) => {selectedRowKeysObj[key] = selectedRowKeys[key]});
    const handleClickRow = (key: string) => {
        if (!onSelectedRowKeysChanged || false) return;
        if (selectionMode === 'single') {
            if (!(key in selectedRowKeysObj) || !selectedRowKeysObj[key]) {
                onSelectedRowKeysChanged([key + '']);
            } else {
                onSelectedRowKeysChanged([]);
            }
        }
        else if (selectionMode === 'multiple') {
            // todo: write this logic. Note, we'll need to also pass in the event to get the ctrl/shift modifiers
            onSelectedRowKeysChanged(
                Object.keys(selectedRowKeysObj)
                    // eslint-disable-next-line eqeqeq
                    .filter(k => k != key && selectedRowKeysObj[k])
                    .concat(selectedRowKeysObj[key] ? [] : [key.toString()])
            );
        }
    }
    return (
        <Table className="NiceTable">
            <TableHead>
                <TableRow>
                    <TableCell key="_first" style={{ width: 0 }} />
                    {
                        columns.map(col => (
                            <TableCell key={col.key}>
                                <span>{col.label}</span>
                            </TableCell>
                        ))
                    }
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    rows.map(row => (
                        <TableRow key={row.key}>
                            <TableCell>
                                {
                                    onDeleteRow && (
                                        <IconButton title={deleteRowLabel || ''} onClick={() => onDeleteRow && onDeleteRow(row.key, row.columnValues)}><Delete /></IconButton>
                                    )
                                }
                                {
                                    onEditRow && (
                                        <IconButton title={editRowLabel || ''} onClick={() => onEditRow && onEditRow(row.key, row.columnValues)}><Edit /></IconButton>
                                    )
                                }
                                {
                                    selectionMode !== 'none' && (
                                        <Checkbox
                                            checked={selectedRowKeysObj[row.key] || false}
                                            onClick={() => handleClickRow(row.key)}
                                        />
                                    )
                                }
                            </TableCell>
                            {
                                columns.map(col => (
                                    <TableCell key={col.key}>
                                        <span>{makeCell(row.columnValues[col.key])}</span>
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    );
};

const makeCell = (x: any) => {
    // eslint-disable-next-line eqeqeq
    if (x == 0) return x;  // !'0' is true, but we shouldn't null out actual 0s
    if (!x) return '';
    if (typeof(x) == "object") {
        if (x.element) return x.element;
        else return x.text || '';
    }
    else {
        return x;
    }
}

export default NiceTable;