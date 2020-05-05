import React, { useState, Fragment } from 'react'
import { addJobHandler, setJobHandlerName, deleteJobHandler, setDefaultJobHandler, setSortingJobHandler } from '../actions/jobHandlers'
import NiceTable from '../components/NiceTable'
import { connect } from 'react-redux';
import { Fab, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RadioChoices from '../components/RadioChoices';
import TextInputControl from '../components/TextInputControl';
import DropdownControl from '../components/DropdownControl';

const ConfigJobHandlers = ({
    jobHandlers,
    defaultJobHandlerId,
    sortingJobHandlerId,
    onAddJobHandler, onSetJobHandlerName, onDeleteJobHandler, onSetDefaultJobHandler, onSetSortingJobHandler
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
    const jobHandlerOptions = [
        {
            label: 'NONE',
            value: null
        },
        ...jobHandlers.map(jh => ({
            label: jh.name,
            value: jh.jobHandlerId
        }))
    ];
    return (
        <div>
            <h1>Job handler configuration</h1>
            <DropdownControl
                label="Default job handler"
                options={jobHandlerOptions}
                value={defaultJobHandlerId}
                onSetValue={onSetDefaultJobHandler}
            />
            <DropdownControl
                label="Sorting job handler"
                options={jobHandlerOptions}
                value={sortingJobHandlerId}
                onSetValue={onSetSortingJobHandler}
            />
            <div style={{ paddingBottom: 15 }} />
            {content}
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
            config: '********************'
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

const CJHAdd = ({ onAdd, onCancel }) => {
    const [jobHandlerType, setJobHandlerType] = useState('default');
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [mongoUri, setMongoUri] = useState('');
    const [databaseName, setDatabaseName] = useState('');
    const [computeResourceId, setComputeResourceId] = useState('');
    const typeOptions = [
        {
            label: 'Local',
            value: 'default'
        },
        {
            label: 'Remote',
            value: 'remote'
        }
    ];
    const handleSubmit = () => {
        if (!name) {
            setErrorMessage('Missing job handler name');
            return;
        }
        let config;
        if (jobHandlerType === 'remote') {
            if (!mongoUri) {
                setErrorMessage('Missing Mongo URI');
                return;
            }
            if (!databaseName) {
                setErrorMessage('Missing database name');
                return;
            }
            if (!computeResourceId) {
                setErrorMessage('Missing compute resource ID');
                return;
            }
            config = {
                mongoUri: mongoUri,
                databaseName: databaseName,
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
                            label="Mongo URI"
                            value={mongoUri}
                            onSetValue={setMongoUri}
                        />
                        <div style={{ paddingBottom: 15 }} />
                        <TextInputControl
                            label="Database name"
                            value={databaseName}
                            onSetValue={setDatabaseName}
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
    defaultJobHandlerId: state.jobHandlers.defaultJobHandlerId,
    sortingJobHandlerId: state.jobHandlers.sortingJobHandlerId
})

const mapDispatchToProps = dispatch => ({
    onAddJobHandler: jh => dispatch(addJobHandler(jh)),
    onSetJobHandlerName: (jobHandlerId, name) => dispatch(setJobHandlerName(jobHandlerId, name)),
    onDeleteJobHandler: (jobHandlerId) => dispatch(deleteJobHandler(jobHandlerId)),
    onSetDefaultJobHandler: (jobHandlerId) => dispatch(setDefaultJobHandler(jobHandlerId)),
    onSetSortingJobHandler: (jobHandlerId) => dispatch(setSortingJobHandler(jobHandlerId))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfigJobHandlers)
