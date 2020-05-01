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
        icon = <Sync />;
        title = 'Loading...';
    }
    else if (persistStatus === 'pending') {
        icon = <Sync />;
        title = 'Pending...';
    }
    else if (persistStatus === 'saving') {
        icon = <Sync />;
        title = 'Saving...';
    }
    else if (persistStatus === 'saved') {
        icon = <CheckCircleOutline />;
        title = "Sync'd to disk"
    }
    else {
        icon = <SyncProblem />;
        title = `Unexpected persistStatus: ${persistStatus}`;
    }

    useEffect(() => {
        (async () => {
            if (persistStatus === 'initial') {
                onSetPersistStatus('pending');
                await sleep(1000);
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
                    await runHitherJob('save_state_to_disk', { state: newSavedState }).wait();
                    lastSavedState.recordings = recordings;
                    await sleep(2000);
                    onSetPersistStatus('saved');
                }
            }
            else {
            }
        })();
    });

    return (
        // <SyncProblem /> <SyncDisabled /> <Sync />
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