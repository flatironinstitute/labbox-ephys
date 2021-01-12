import { IconButton } from '@material-ui/core';
import { CheckCircleOutline, Sync, SyncProblem } from '@material-ui/icons';
import React, { Dispatch, FunctionComponent, useEffect } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { setPersistStatus, sleep } from '../actions';
import { RootAction, RootState } from '../reducers';

interface StateProps {
    persistStatus: string
}

interface DispatchProps {
    onSetPersistStatus: (status: string) => void
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

const PersistStateControl: FunctionComponent<Props> = ({ persistStatus, onSetPersistStatus }) => {
    let icon;
    let title;
    if (persistStatus === 'initial') {
        icon = <Sync style={{color: 'white'}} />;
        title = 'Loading...';
    }
    else if (persistStatus === 'pending') {
        icon = <Sync style={{color: 'lightgreen'}} />;
        title = 'Pending...';
    }
    else if (persistStatus === 'saving') {
        icon = <Sync style={{color: 'green'}} />;
        title = 'Saving...';
    }
    else if (persistStatus === 'saved') {
        icon = <CheckCircleOutline style={{color: 'white'}} />;
        title = "Sync'd to disk"
    }
    else if (persistStatus === 'error') {
        icon = <SyncProblem style={{color: 'red'}} />;
        title = `Error storing state to disk.`;
    }
    else {
        icon = <SyncProblem style={{color: 'pink'}} />;
        title = `Unexpected persistStatus: ${persistStatus}`;
    }

    useEffect(() => {
        (async () => {
            if (persistStatus === 'initial') {
                onSetPersistStatus('pending');
                // the gui experience is better when we slow things down a bit
                await sleep(500);
                // const s = await createHitherJob('get_state_from_disk', {}, {wait: true, useClientCache: false});
                onSetPersistStatus('saved');
            }
            else if (persistStatus === 'pending') {
            }
            else if (persistStatus === 'saving') {
            }
            else if (persistStatus === 'saved') {
                // onSetPersistStatus('pending');
                // // save here
                // const newSavedState = {
                // }
                // // TODO: IMPORTANT!! handle case where state has changed while we are saving to disk
                // onSetPersistStatus('saving');
                // // const ret = await createHitherJob('save_state_to_disk', { state: newSavedState }, {wait: true, useClientCache: false});
                // // the gui experience is better when we slow things down a bit
                // await sleep(500);
                // // if (ret) {
                // onSetPersistStatus('saved');
                // //}
                // // else {
                // //     onSetPersistStatus('error');
                // // }
            }
            else {
            }
        })();
    });

    return (
        <IconButton title={title}>{icon}</IconButton>
    );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    persistStatus: state.persisting.status,
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    onSetPersistStatus: (status) => dispatch(setPersistStatus(status))
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(PersistStateControl)