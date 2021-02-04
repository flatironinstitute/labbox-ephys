import { Button, Paper } from "@material-ui/core";
import React, { FunctionComponent } from 'react';
import SortingsTable from '../containers/SortingsTable';
import { WorkspaceInfo } from "../extensions/extensionInterface";
import { WorkspaceRouteDispatch } from "../extensions/WorkspaceView";
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