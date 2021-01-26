import { Button, Paper } from "@material-ui/core";
import React, { FunctionComponent } from 'react';
import { WorkspaceInfo } from "../AppContainer";
import SortingsTable from '../containers/SortingsTable';
import { WorkspaceRouteDispatch } from "../containers/WorkspaceView";
import { Sorting } from "../reducers/sortings";

type Props = {
    sortings: Sorting[]
    onImportSortings: (() => void) | null
    workspaceRouteDispatch: WorkspaceRouteDispatch
    workspaceInfo: WorkspaceInfo
}

const SortingsView: FunctionComponent<Props> = ({ sortings, onImportSortings, workspaceRouteDispatch, workspaceInfo }) => {
    return (
        <Paper>
            <h3>{`${sortings.length} sortings`}</h3>
            {onImportSortings && <Button onClick={onImportSortings}>Import sortings</Button>}
            <SortingsTable sortings={sortings} workspaceRouteDispatch={workspaceRouteDispatch} workspaceInfo={workspaceInfo} />
        </Paper>
    );
}

export default SortingsView;