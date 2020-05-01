import React, { useEffect } from 'react'
import { IconButton } from '@material-ui/core';
import { Sync, CheckCircleOutline, SyncProblem } from '@material-ui/icons';
import { connect } from 'react-redux';
import { setPersistStatus, runHitherJob, addRecording } from '../actions';

const lastSavedState = {
    recordings: null
};

const sleep = m => new Promise(r => setTimeout(r, m))

const PersistStateControl = ({ recordings, onAddRecording, persistStatus, onSetPersistStatus }) => {
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
                const s = await runHitherJob('get_state_from_disk', {}, {}).wait();
                (s.recordings || []).forEach(r => {
                    onAddRecording(r);
                });
                onSetPersistStatus('saved');
            }
            else if (persistStatus === 'pending') {
            }
            else if (persistStatus === 'saving') {
            }
            else if (persistStatus === 'saved') {
                if (recordings !== lastSavedState.recordings) {
                    onSetPersistStatus('pending');
                    // save here
                    const newSavedState = {
                        recordings: recordings
                    }
                    // TODO: IMPORTANT!! handle case where state has changed while we are saving to disk
                    onSetPersistStatus('saving');
                    const ret = await runHitherJob('save_state_to_disk', { state: newSavedState }).wait();
                    lastSavedState.recordings = recordings;
                    // the gui experience is better when we slow things down a bit
                    await sleep(500);
                    if (ret) {
                        onSetPersistStatus('saved');
                    }
                    else {
                        onSetPersistStatus('error');
                    }
                }
            }
            else {
            }
        })();
    });

    return (
        <IconButton title={title}>{icon}</IconButton>
    );
}

const mapStateToProps = state => ({
    persistStatus: state.persisting.status,
    recordings: state.recordings
})

const mapDispatchToProps = dispatch => ({
    onSetPersistStatus: (status) => dispatch(setPersistStatus(status)),
    onAddRecording: (r) => dispatch(addRecording(r))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PersistStateControl);