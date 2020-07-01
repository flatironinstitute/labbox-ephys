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
    selectedRowKeys && selectedRowKeys.forEach((val, idx) => {selectedRowKeysObj[idx+1] = val});
    const handleClickRow = (key) => {
        if (!onSelectedRowKeysChanged || false) return;
        if (selectionMode === 'single') {
            if (!(key in selectedRowKeysObj) || !selectedRowKeysObj[key]) {
                onSelectedRowKeysChanged([key.toString()]);
            } else {
                onSelectedRowKeysChanged([]);
            }
        }
        else if (selectionMode === 'multiple') {
            // todo: write this logic. Note, we'll need to also pass in the event to get the ctrl/shift modifiers
            // I actually think the UI expectation for a checkbox is such that we shouldn't worry about modifier
            // keys--just treat any click like a ctrl-click. (I would also, if possible, use radio buttons
            // in place of checkboxes for the row selection in single-select mode.)
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
                                            checked={selectedRowKeysObj[row.key] || false}
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