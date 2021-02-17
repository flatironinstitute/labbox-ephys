import { IconButton } from '@material-ui/core';
import { CheckCircleOutline, Sync, SyncProblem } from '@material-ui/icons';
import { LabboxProviderContext } from 'labbox';
import React, { FunctionComponent, useCallback, useContext } from 'react';

type Props = {}

const ServerStatusControl: FunctionComponent<Props> = () => {
    const { websocketStatus, onReconnectWebsocket } = useContext(LabboxProviderContext)

    let icon;
    let title;
    switch (websocketStatus) {
        case 'waiting': {
            icon = <Sync style={{color: 'blue'}} />
            title = 'Loading...'
            break
        }
        case 'connected': {
            icon = <CheckCircleOutline style={{color: 'white'}} />;
            title = "Connected"
            break
        }
        case 'disconnected': {
            icon = <SyncProblem style={{color: 'red'}} />;
            title = `Disconnected from server. Click to attempt reconnect.`;
            break
        }
    }

    const handleClick = useCallback(() => {
        if (websocketStatus === 'disconnected') {
            onReconnectWebsocket()
        }
    }, [websocketStatus, onReconnectWebsocket])

    return (
        <IconButton title={title} onClick={handleClick}>{icon}</IconButton>
    );
}

export default ServerStatusControl