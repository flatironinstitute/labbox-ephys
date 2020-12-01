import { Button, Paper } from "@material-ui/core";
import React from 'react';
import SortingsTable from '../containers/SortingsTable';

const SortingsView = ({ sortings, onImportSortings }) => {
    return (
        <Paper>
            <h3>{`${sortings.length} sortings`}</h3>
            {onImportSortings && <Button onClick={onImportSortings}>Import sortings</Button>}
            <SortingsTable sortings={sortings} />
        </Paper>
    );
}

export default SortingsView;