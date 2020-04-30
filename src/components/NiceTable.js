import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, IconButton } from '@material-ui/core';
import { Delete, Edit } from "@material-ui/icons"
import './NiceTable.css'

const NiceTable = ({ rows, columns, onDeleteRow, deleteRowLabel, onEditRow, editRowLabel }) => {
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
                                    onDeleteRow ? (
                                        <IconButton title={deleteRowLabel || ''} onClick={() => onDeleteRow && onDeleteRow(row)}><Delete /></IconButton>
                                    ) : (<span />)
                                }
                                {
                                    onEditRow ? (
                                        <IconButton title={editRowLabel || ''} onClick={() => onEditRow && onEditRow(row)}><Edit /></IconButton>
                                    ) : (<span />)
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
    console.log(x);
    if (typeof(x) == "object") {
        if (x.element) return x.element;
        else return x.text || '';
    }
    else {
        return x;
    }
}

export default NiceTable;