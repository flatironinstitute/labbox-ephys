import { Paper } from "@material-ui/core";
import { WorkspaceInfo } from 'labbox';
import React, { FunctionComponent } from 'react';
import { Sorting } from "../pluginInterface";
import SortingsTable from './SortingsTable';
import { WorkspaceRouteDispatch } from "./WorkspaceView";

type Props = {
    sortings: Sorting[]
    workspaceRouteDispatch: WorkspaceRouteDispatch
    workspaceInfo: WorkspaceInfo
    onDeleteSortings: (sortingIds: string[]) => void
}

const SortingsView: FunctionComponent<Props> = ({ sortings, workspaceRouteDispatch, workspaceInfo, onDeleteSortings }) => {
    return (
        <Paper>
            <h3>{`${sortings.length} sortings`}</h3>
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