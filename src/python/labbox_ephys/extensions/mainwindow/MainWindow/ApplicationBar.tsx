import { AppBar, Toolbar } from '@material-ui/core';
import React, { FunctionComponent, useCallback } from 'react';
import { WorkspaceRouteDispatch } from '../../pluginInterface';
import HitherJobMonitorControl from './HitherJobMonitorControl';
import ServerStatusControl from './ServerStatusControl';
import SettingsControl from './SettingsControl';


const appBarHeight = 50

type Props = {
    onOpenSettings: () => void
    workspaceRouteDispatch: WorkspaceRouteDispatch
    logo?: any
}

const ApplicationBar: FunctionComponent<Props> = ({ onOpenSettings, workspaceRouteDispatch, logo }) => {
    const handleHome = useCallback(() => {
        workspaceRouteDispatch({type: 'gotoRecordingsPage'})
    }, [workspaceRouteDispatch])
    return (
        <AppBar position="static" style={{height: appBarHeight, color: 'white'}}>
            <Toolbar>
            {
                logo && (<img src={logo} className="App-logo" alt="logo" height={30} style={{paddingBottom: 5, cursor: 'pointer'}} onClick={handleHome} />)
            }
            &nbsp;&nbsp;&nbsp;<span style={{paddingBottom: 0, color: 'white', fontFamily: 'sans-serif', fontWeight: 'bold'}}>Labbox Ephys</span>
            <span style={{marginLeft: 'auto'}} />
            <span style={{paddingBottom: 0, color: 'white'}}>
                <SettingsControl onOpenSettings={onOpenSettings} color={'white'} />
                <ServerStatusControl color={'white'} />
                <HitherJobMonitorControl />
            </span>
            </Toolbar>
        </AppBar>
    )
}

export default ApplicationBar