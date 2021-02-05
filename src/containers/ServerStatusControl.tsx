import { IconButton } from '@material-ui/core';
import { CheckCircleOutline, Sync, SyncProblem } from '@material-ui/icons';
import React, { Dispatch, FunctionComponent, useCallback } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { setPersistStatus } from '../actions';
import { RootAction, RootState } from '../reducers';
import { ServerConnectionState } from '../reducers/serverConnection';

interface StateProps {
    serverConnection: ServerConnectionState
}

interface DispatchProps {
    onSetPersistStatus: (status: string) => void
}

interface OwnProps {
    onReconnect: () => void
}

type Props = StateProps & DispatchProps & OwnProps

const ServerStatusControl: FunctionComponent<Props> = ({ serverConnection, onReconnect }) => {
    let icon;
    let title;
    if (serverConnection.websocketStatus)
    switch (serverConnection.websocketStatus) {
        case 'pending': {
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
        if (serverConnection.websocketStatus === 'disconnected') {
            onReconnect()
        }
    }, [serverConnection.websocketStatus, onReconnect])

    return (
        <IconButton title={title} onClick={handleClick}>{icon}</IconButton>
    );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    serverConnection: state.serverConnection
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    onSetPersistStatus: (status) => dispatch(setPersistStatus(status))
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ServerStatusControl)