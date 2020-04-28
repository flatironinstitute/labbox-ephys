import React, { useState } from 'react'
import { connect } from 'react-redux'
import NiceTable from '../components/NiceTable'
import { deleteComputeResource, fetchComputeResourceJobStats, fetchComputeResourceActive } from '../actions';
import AddComputeResource from './AddComputeResource';
import EditComputeResource from './EditComputeResource';
import { Link } from 'react-router-dom';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { Button, CircularProgress } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';

const ComputeResourcesTable = ({ computeResources, onDeleteComputeResource, onFetchComputeResourceJobStats, onFetchComputeResourceActive }) => {

    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    computeResources = sortByKey(computeResources, 'computeResourceName');

    const [mode, setMode] = useState('view');
    const [currentComputeResource, setCurrentComputeResource] = useState(null);

    const handleEditComputeResource = (computeResource) => {
        setCurrentComputeResource(computeResource);
        setMode('edit');
    }

    const getJobsElement = (cr) => {
        const refresh = () => {
            onFetchComputeResourceJobStats(cr.computeResourceName);
        }
        const width = 200;
        let ret;
        if (cr.fetchingJobStats) {
            ret = <CircularProgress color="secondary" />;
        }
        else if (cr.jobStats) {
            const s = cr.jobStats;
            if (s.error) {
                ret = <Button onClick={() => refresh()}>{`Error `}<Refresh /></Button>
            }
            else {
                ret = s.numTotal ? (
                    <span>
                        <span>{s.numQueued ? `${s.numQueued} queued ` : ``}</span>
                        <span>{s.numRunning ? `${s.numRunning} running ` : ``}</span>
                        <span>{s.numFinished ? `${s.numFinished} finished ` : ``}</span>
                        <span>{s.numError ? `${s.numError} errored ` : ``}</span>
                        <Button onClick={() => refresh()}><Refresh /></Button>
                    </span>
                ) : <span>
                        <Button onClick={() => refresh()}>{`No jobs `}<Refresh /></Button>
                    </span>
            }
        }
        else {
            setTimeout(function () {
                refresh();
            }, 0);
            ret = <span>Waiting for fetch...</span>;
        }
        return (
            <span style={{ minWidth: width, maxWidth: width, display: "block" }}>
                {ret}
            </span>
        )
    }

    const getActiveElement = (cr) => {
        const width = 60;
        let ret;
        if (cr.fetchingActive) {
            ret = <CircularProgress color="secondary" />;
        }
        else if (cr.active === true) {
            ret = <span style={{ color: "darkgreen" }}>Not-implemented</span>;
        }
        else if (cr.active === false) {
            ret = <span style={{ color: "darkred" }}>Not active</span>;
        }
        else {
            setTimeout(function () {
                onFetchComputeResourceActive(cr.computeResourceName);
            }, 0);
            ret = <span>Waiting for fetch...</span>;
        }
        return (
            <span style={{ minWidth: width, maxWidth: width, display: "block" }}>
                {ret}
            </span>
        )
    }

    const rows = computeResources.map(cr => ({
        computeResource: cr,
        key: cr.computeResourceName,
        computeResourceName: {
            element: <Link title={"View this compute resource"} to={`/computeResource/${cr.computeResourceName}`}>{cr.computeResourceName}</Link>
        },
        active: { element: getActiveElement(cr) },
        jobs: { element: getJobsElement(cr) }
    }));

    const columns = [
        {
            key: 'computeResourceName',
            label: 'Compute resource name'
        },
        {
            key: 'active',
            label: 'Active'
        },
        {
            key: 'jobs',
            label: 'Jobs'
        }
    ]

    if (mode === 'view') {
        return (
            <div>
                <NiceTable
                    rows={rows}
                    columns={columns}
                    deleteRowLabel={"Delete this compute resource"}
                    onDeleteRow={(row) => onDeleteComputeResource(row.computeResource.computeResourceName)}
                    editRowLabel={"Edit this compute resource"}
                    onEditRow={(row) => handleEditComputeResource(row.computeResource)}
                />
                <div style={{padding: 20}}>
                    <Fab color="primary" onClick={() => setMode('add')} title="Add compute resource"><AddIcon /></Fab>
                </div>
            </div>
        );
    }
    else if (mode === 'add') {
        return (
            <AddComputeResource
                onDone={() => setMode('view')}
                existingComputeResourceNames={computeResources.map(cr => cr.computeResourceName)}
            />
        )
    }
    else if (mode === 'edit') {
        return (
            <EditComputeResource
                onDone={() => setMode('view')}
                computeResource={currentComputeResource}
            />
        )
    }
    else {
        return <div>Invalid mode.</div>
    }
}

const mapStateToProps = state => ({
    computeResources: state.computeResources
})

const mapDispatchToProps = dispatch => ({
    onDeleteComputeResource: computeResourceName => dispatch(deleteComputeResource(computeResourceName)),
    onFetchComputeResourceJobStats: computeResourceName => dispatch(fetchComputeResourceJobStats(computeResourceName)),
    onFetchComputeResourceActive: computeResourceName => dispatch(fetchComputeResourceActive(computeResourceName))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ComputeResourcesTable)
