import { Button, Paper } from "@material-ui/core";
import React, { FunctionComponent } from 'react';
import { WorkspaceInfo } from ".";
import { Sorting } from "../extensionInterface";
import SortingsTable from './SortingsTable';
import { WorkspaceRouteDispatch } from "./WorkspaceView";

type Props = {
    sortings: Sorting[]
    onImportSortings: (() => void) | null
    workspaceRouteDispatch: WorkspaceRouteDispatch
    workspaceInfo: WorkspaceInfo
    onDeleteSortings: (sortingIds: string[]) => void
}

const SortingsView: FunctionComponent<Props> = ({ sortings, onImportSortings, workspaceRouteDispatch, workspaceInfo, onDeleteSortings }) => {
    return (
        <Paper>
            <h3>{`${sortings.length} sortings`}</h3>
            {onImportSortings && <Button onClick={onImportSortings}>Import sortings</Button>}
            <SortingsTable
                sortings={sortings}
                workspaceRouteDispatch={workspaceRouteDispatch}
                workspaceInfo={workspaceInfo}
                onDeleteSortings={onDeleteSortings}
            />
        </Paper>
    );
}

export default SortingsView;