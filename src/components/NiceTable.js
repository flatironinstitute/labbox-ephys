import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, IconButton, Checkbox } from '@material-ui/core';
import { Delete, Edit } from "@material-ui/icons"
import './NiceTable.css'

const NiceTable = ({
    rows,
    columns,
    onDeleteRow,
    deleteRowLabel,
    onEditRow,
    editRowLabel,
    selectionMode='none', // none, single, multiple
    selectedRowKeys,
    onSelectedRowKeysChanged
}) => {

    const selectedRowKeysObj = {};
    selectedRowKeys && selectedRowKeys.forEach(k => {selectedRowKeysObj[k] = true});
    const handleClickRow = (key) => {
        if (selectionMode === 'single') {
            if (key in selectedRowKeysObj) {
                onSelectedRowKeysChanged && onSelectedRowKeysChanged([]);
            }
            else {
                onSelectedRowKeysChanged && onSelectedRowKeysChanged([key]);
            }
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
                                        <IconButton title={deleteRowLabel || ''} onClick={() => onDeleteRow && onDeleteRow(row)}><Delete /></IconButton>
                                    )
                                }
                                {
                                    onEditRow && (
                                        <IconButton title={editRowLabel || ''} onClick={() => onEditRow && onEditRow(row)}><Edit /></IconButton>
                                    )
                                }
                                {
                                    selectionMode !== 'none' && (
                                        <Checkbox
                                            checked={row.key in selectedRowKeysObj}
                                            onClick={() => handleClickRow(row.key)}
                                        />
                                    )
                                }
                            </TableCell>
                            {
                                columns.map(col => (
                                    <TableCell key={col.key}>
                                        <span>{makeCell(row[col.key])}</span>
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

const makeCell = (x) => {
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