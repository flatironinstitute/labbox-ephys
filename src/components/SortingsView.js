import React from 'react'
import { Paper, Button } from "@material-ui/core";
import SortingsTable from '../containers/SortingsTable';
import SortingJobsTable from '../containers/SortingJobsTable'

const SortingsView = ({ sortings, sortingJobs, onImportSortings }) => {
    return (
        <Paper>
            <h3>{`${sortingJobs.length} sorting jobs`}</h3>
            <SortingJobsTable sortingJobs={sortingJobs} />
            <h3>{`${sortings.length} sortings`}</h3>
            {onImportSortings && <Button onClick={onImportSortings}>Import sortings</Button>}
            <SortingsTable sortings={sortings} />
        </Paper>
    );
}

export default SortingsView;