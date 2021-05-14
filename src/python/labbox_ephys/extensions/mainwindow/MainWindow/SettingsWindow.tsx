import { Table, TableCell, TableRow } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LabboxProviderContext } from 'labbox';
import React, { FunctionComponent, useContext } from 'react';
import { parseWorkspaceUri } from '../../pluginInterface/misc';
import { WorkspaceState } from '../../pluginInterface/workspaceReducer';

const useStyles = makeStyles((theme) => ({
    paper: {
        left: 100,
        top: 100,
        right: 100,
        bottom: 100,
        position: 'absolute',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        overflow: 'auto'
    },
}));

type Props = {
    workspace: WorkspaceState
    workspaceUri: string | undefined
    version: string
}

const SettingsWindow: FunctionComponent<Props> = ({ workspaceUri, version }) => {
    const classes = useStyles();
    const { serverInfo } = useContext(LabboxProviderContext)
    return (
        <div className={classes.paper} style={{zIndex: 9999}}>
            <h2>Labbox Ephys {version}</h2>
            <Table>
                <TableRow>
                    <TableCell>Workspace URI</TableCell>
                    <TableCell>{workspaceUri || ''}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Kachery node ID</TableCell>
                    <TableCell>{serverInfo ? serverInfo.nodeId : ''}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Default feed ID</TableCell>
                    <TableCell>{serverInfo ? serverInfo.defaultFeedId : ''}</TableCell>
                </TableRow>
            </Table>
        </div>
    )
}

export default SettingsWindow