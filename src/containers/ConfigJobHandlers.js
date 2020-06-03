import React, { useState, Fragment } from 'react'
import { addJobHandler, setJobHandlerName, deleteJobHandler, assignJobHandlerToRole } from '../actions/jobHandlers'
import NiceTable from '../components/NiceTable'
import { connect } from 'react-redux';
import { Fab, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RadioChoices from '../components/RadioChoices';
import TextInputControl from '../components/TextInputControl';
import DropdownControl from '../components/DropdownControl';

const ConfigJobHandlers = ({
    jobHandlers,
    roleAssignments,
    onAddJobHandler,
    onSetJobHandlerName,
    onDeleteJobHandler,
    onAssignJobHandlerToRole
}) => {
    const [mode, setMode] = useState('table');

    const handleAddJobHandler = (jh) => {
        onAddJobHandler(jh);
        setMode('table');
    }

    let content;
    switch (mode) {
        case "table":
            content = (
                <div>
                    <CJHTable {...{ jobHandlers, onDeleteJobHandler }} />
                    <div style={{ padding: 20 }}>
                        <Fab color="primary" onClick={() => setMode('add')} title="Add job handler"><AddIcon /></Fab>
                    </div>
                </div>
            )
            break;
        case "add":
            content = (
                <CJHAdd onAdd={handleAddJobHandler} onCancel={() => { setMode('table') }} />
            )
            break;
        default:
            content = <div>Unexpected mode</div>
            break;
    }
    return (
        <div>
            <h1>Job handler configuration</h1>
            <CJHRoles jobHandlers={jobHandlers} roleAssignments={roleAssignments} onAssignJobHandlerToRole={onAssignJobHandlerToRole} />
            <div style={{ paddingBottom: 15 }} />
            {content}
            <h2>Hosting a compute resource server on your own computer</h2>
            <p>To host a compute resource server on your own computer, do the following.</p>
            <ul>
                <li>
                    Install the most recent version of hither: <pre>pip install --upgrade git+git://github.com/flatironinstitute/hither</pre>
                </li>
                <li>
                    Create a new directory on your computer. For example: <pre>mkdir /home/user/labbox/compute_resource</pre>
                </li>
                <li>
                    Change to that directory and run the configuration utility:
                    <pre>cd /home/user/labbox/compute_resource</pre>
                    <pre>hither-compute-resource config</pre>
                </li>
                <li>
                    Follow the instructions to set up and run the compute resource server.
                </li>
                <li>
                    Finally, add a new job handler and enter the configuration information displayed in the terminal when you run the compute resource.
                </li>
            </ul>
        </div>
    );
}

const CJHTable = ({ jobHandlers, onDeleteJobHandler }) => {
    const columns = [
        {
            key: 'name',
            label: 'Job handler'
        },
        {
            key: 'jobHandlerId',
            label: 'ID'
        },
        {
            key: 'jobHandlerType',
            label: 'Type'
        },
        {
            key: 'config',
            label: 'Config'
        }
    ]
    const rows = jobHandlers.map(jh => (
        {
            key: jh.jobHandlerId,
            jobHandler: jh,
            jobHandlerId: jh.jobHandlerId,
            name: jh.name,
            jobHandlerType: jh.jobHandlerType,
            config: JSON.stringify(jh.config)
        }
    ));

    return (
        <NiceTable
            rows={rows}
            columns={columns}
            onDeleteRow={row => onDeleteJobHandler(row.jobHandler.jobHandlerId)}
        />
    )
}

const CJHRoles = ({ jobHandlers, roleAssignments, onAssignJobHandlerToRole }) => {
    const jobHandlerOptions = [
        {
            label: 'NONE',
            value: ''
        },
        ...jobHandlers.map(jh => ({
            label: jh.name,
            value: jh.jobHandlerId
        }))
    ];
    const roles = [
        {
            name: "general",
            label: "General job handler"
        },
        {
            name: "sorting",
            label: "Spike sorting job handler"
        }
    ];
    return (
        <div className="CHJRoles">
            {
                roles.map((role) => (
                    <Fragment key={role.label}>
                        <DropdownControl
                            label={role.label}
                            options={jobHandlerOptions}
                            value={roleAssignments[role.name] || ''}
                            onSetValue={val => onAssignJobHandlerToRole({role: role.name, jobHandlerId: val})}
                        />                
                        <div style={{ paddingBottom: 15 }} />
                    </Fragment>
                ))
            }
        </div>
    )
}

const CJHAdd = ({ onAdd, onCancel }) => {
    const [jobHandlerType, setJobHandlerType] = useState('remote');
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [eventStreamUrl, setEventStreamUrl] = useState('');
    const [channel, setChannel] = useState('');
    const [password, setPassword] = useState('');
    const [computeResourceId, setComputeResourceId] = useState('');
    const typeOptions = [
        {
            label: 'Remote',
            value: 'remote'
        },
        {
            label: 'Within labbox-ephys container',
            value: 'internal'
        }
    ];
    const handleSubmit = () => {
        if (!name) {
            setErrorMessage('Missing job handler name');
            return;
        }
        let config;
        if (jobHandlerType === 'remote') {
            if (!eventStreamUrl) {
                setErrorMessage('Missing event stream url');
                return;
            }
            if (!channel) {
                setErrorMessage('Missing channel');
                return;
            }
            if (!password) {
                setErrorMessage('Missing password');
                return;
            }
            if (!computeResourceId) {
                setErrorMessage('Missing compute resource ID');
                return;
            }
            config = {
                eventStreamUrl: eventStreamUrl,
                channel: channel,
                password: password,
                computeResourceId: computeResourceId
            };
        }
        else {
            config = {};
        }
        setErrorMessage('');
        onAdd({
            jobHandlerId: randomString(8),
            jobHandlerType,
            name,
            config: config
        });
    }
    return (
        <div>
            <TextInputControl
                label="Job handler name"
                value={name}
                onSetValue={setName}
            />
            <div style={{ paddingBottom: 15 }} />
            <RadioChoices
                label="Type"
                value={jobHandlerType}
                onSetValue={setJobHandlerType}
                options={typeOptions}
            />
            <div style={{ paddingBottom: 15 }} />
            {
                (jobHandlerType === 'remote') && (
                    <Fragment>
                        <TextInputControl
                            label="Event stream URL"
                            value={eventStreamUrl}
                            onSetValue={setEventStreamUrl}
                        />
                        <div style={{ paddingBottom: 15 }} />
                        <TextInputControl
                            label="Channel"
                            value={channel}
                            onSetValue={setChannel}
                        />
                        <div style={{ paddingBottom: 15 }} />
                        <TextInputControl
                            label="Password"
                            value={password}
                            onSetValue={setPassword}
                        />
                        <div style={{ paddingBottom: 15 }} />
                        <TextInputControl
                            label="Compute resource ID"
                            value={computeResourceId}
                            onSetValue={setComputeResourceId}
                        />
                        <div style={{ paddingBottom: 15 }} />
                    </Fragment>
                )
            }

            <div className="invalid-feedback">{errorMessage}</div>
            <Button color="primary" onClick={handleSubmit}>Add this job handler</Button>
            <div>
                <Button color="secondary" onClick={onCancel}>Cancel</Button>
            </div>
        </div>
    )
}

function randomString(num_chars) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

const mapStateToProps = state => ({
    jobHandlers: state.jobHandlers.jobHandlers,
    roleAssignments: state.jobHandlers.roleAssignments,
    defaultJobHandlerId: state.jobHandlers.defaultJobHandlerId,
    sortingJobHandlerId: state.jobHandlers.sortingJobHandlerId
})

const mapDispatchToProps = dispatch => ({
    onAddJobHandler: jh => dispatch(addJobHandler(jh)),
    onSetJobHandlerName: (jobHandlerId, name) => dispatch(setJobHandlerName(jobHandlerId, name)),
    onDeleteJobHandler: (jobHandlerId) => dispatch(deleteJobHandler(jobHandlerId)),
    onAssignJobHandlerToRole: ({ role, jobHandlerId }) => dispatch(assignJobHandlerToRole({ role, jobHandlerId }))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfigJobHandlers)
