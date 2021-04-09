import { Paper } from "@material-ui/core";
import React, { FunctionComponent } from 'react';
import { Sorting, WorkspaceRoute, WorkspaceRouteDispatch } from "../../pluginInterface";
import SortingsTable from './SortingsTable';

type Props = {
    sortings: Sorting[]
    workspaceRouteDispatch: WorkspaceRouteDispatch
    workspaceRoute: WorkspaceRoute
    onDeleteSortings: (sortingIds: string[]) => void
}

const SortingsView: FunctionComponent<Props> = ({ sortings, workspaceRouteDispatch, workspaceRoute, onDeleteSortings }) => {
    return (
        <Paper>
            <h3>{`${sortings.length} sorting${sortings.length !== 1 ? "s" : ""}`}</h3>
            <SortingsTable
                sortings={sortings}
                workspaceRouteDispatch={workspaceRouteDispatch}
                readOnly={false}
                onDeleteSortings={onDeleteSortings}
            />
        </Paper>
    );
}

export default SortingsView;