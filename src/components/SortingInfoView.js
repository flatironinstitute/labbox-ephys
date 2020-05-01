import React from 'react'
import { Table, TableHead, TableRow, TableBody, TableCell } from '@material-ui/core';

const SortingInfoView = ({ sortingInfo  }) => {
    const si = sortingInfo;
    return (
        <div>
            <div style={{ width: 600 }}>
                <SortingViewTable
                    unit_ids={si.unit_ids}
                />
            </div>
        </div>
    );
}

const SortingViewTable = ({ unit_ids }) => {
    return (
        <Table>
            <TableHead>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Unit IDs</TableCell>
                    <TableCell>{commasep(unit_ids)}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}

function commasep(x) {
    if (!x) return JSON.stringify(x);
    return x.join(', ');
}

export default SortingInfoView;