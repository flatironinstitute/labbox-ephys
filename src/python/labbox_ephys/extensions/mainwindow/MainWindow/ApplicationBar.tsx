import { AppBar, Toolbar } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import HitherJobMonitorControl from './HitherJobMonitorControl';
import logo from './logo.svg';
import ServerStatusControl from './ServerStatusControl';
import SettingsControl from './SettingsControl';


const appBarHeight = 50

type Props = {
    onOpenSettings: () => void
}

const ApplicationBar: FunctionComponent<Props> = ({ onOpenSettings }) => {
    return (
        <AppBar position="static" style={{height: appBarHeight, background: '#d85636'}}>
            <Toolbar>
            <img src={logo} className="App-logo" alt="logo" height={30} style={{paddingBottom: 15}} />
            &nbsp;<span style={{paddingBottom: 10, color: '#312a00', fontFamily: 'sans-serif', fontWeight: 'bold'}}>Labbox Ephys</span>
            <span style={{marginLeft: 'auto'}} />
            <span style={{paddingBottom: 15, color: '#312a00'}}>
                <SettingsControl onOpenSettings={onOpenSettings} />
                <ServerStatusControl />
                <HitherJobMonitorControl />
            </span>
            </Toolbar>
        </AppBar>
    )
}

export default ApplicationBar