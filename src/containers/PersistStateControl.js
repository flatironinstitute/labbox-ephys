import React, { useEffect } from 'react'
import { IconButton } from '@material-ui/core';
import { Sync, CheckCircleOutline, SyncProblem } from '@material-ui/icons';
import { connect } from 'react-redux';
import { setPersistStatus, createHitherJob, addRecording, addSorting, sleep } from '../actions';
import { assignJobHandlerToRole, addJobHandler } from '../actions/jobHandlers';

const lastSavedState = {
    recordings: null,
    sortings: null,
    jobHandlers: null
};

const PersistStateControl = ({
    recordings, onAddRecording,
    sortings, onAddSorting,
    jobHandlers, onAddJobHandler, onAssignJobHandlerToRole,
    persistStatus, onSetPersistStatus
}) => {
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
                const s = await createHitherJob('get_state_from_disk', {}, {wait: true});
                (s.recordings || []).forEach(x => {
                    onAddRecording(x);
                });
                (s.sortings || []).forEach(x => {
                    onAddSorting(x);
                });
                const jobHandlers = (s.jobHandlers || {}).jobHandlers || [];
                const roleAssignments = (s.jobHandlers || {}).roleAssignments || {};
                jobHandlers.forEach(x => {
                    onAddJobHandler(x);
                });
                const roles = Object.keys(roleAssignments);
                roles.forEach(r => {
                    onAssignJobHandlerToRole({ role: r, jobHandlerId: roleAssignments[r] })
                });
                onSetPersistStatus('saved');
            }
            else if (persistStatus === 'pending') {
            }
            else if (persistStatus === 'saving') {
            }
            else if (persistStatus === 'saved') {
                if (
                    (recordings !== lastSavedState.recordings) ||
                    (sortings !== lastSavedState.sortings) ||
                    (jobHandlers !== lastSavedState.jobHandlers)
                ) {
                    onSetPersistStatus('pending');
                    // save here
                    const newSavedState = {
                        recordings: recordings,
                        sortings: sortings,
                        jobHandlers: jobHandlers
                    }
                    // TODO: IMPORTANT!! handle case where state has changed while we are saving to disk
                    onSetPersistStatus('saving');
                    const ret = await createHitherJob('save_state_to_disk', { state: newSavedState }, {wait: true});
                    lastSavedState.recordings = recordings;
                    lastSavedState.sortings = sortings;
                    lastSavedState.jobHandlers = jobHandlers;
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
    recordings: state.recordings,
    sortings: state.sortings,
    jobHandlers: state.jobHandlers
})

const mapDispatchToProps = dispatch => ({
    onSetPersistStatus: (status) => dispatch(setPersistStatus(status)),
    onAddRecording: r => dispatch(addRecording(r)),
    onAddSorting: s => dispatch(addSorting(s)),
    onAddJobHandler: jh => dispatch(addJobHandler(jh)),
    onAssignJobHandlerToRole: ({ role, jobHandlerId }) => dispatch(assignJobHandlerToRole({ role, jobHandlerId }))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PersistStateControl);