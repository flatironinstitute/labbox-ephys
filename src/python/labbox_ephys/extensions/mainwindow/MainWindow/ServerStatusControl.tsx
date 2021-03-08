import { IconButton } from '@material-ui/core';
import { CheckCircleOutline, Sync, SyncProblem } from '@material-ui/icons';
import { LabboxProviderContext } from 'labbox';
import React, { FunctionComponent, useCallback, useContext, useMemo } from 'react';

type Props = {
    color: any
}

const ServerStatusControl: FunctionComponent<Props> = ({ color }) => {
    const { websocketStatus, onReconnectWebsocket } = useContext(LabboxProviderContext)

    const { icon, title } = useMemo(() => {
        switch (websocketStatus) {
            case 'waiting': {
                return {icon: <Sync style={{color: 'blue'}} />, title: 'Loading...'}
            }
            case 'connected': {
                return {icon: <CheckCircleOutline style={{color}} />, title: 'Connected'}
            }
            case 'disconnected': {
                return {icon: <SyncProblem style={{color: 'red'}} />, title: `Disconnected from server. Click to attempt reconnect.`}
            }
            default: {
                throw Error('Unexpected.')
            }
        }
    }, [websocketStatus, color])

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