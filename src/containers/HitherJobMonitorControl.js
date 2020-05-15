import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { setDispatch } from '../hither/createHitherJob'
import { Link } from 'react-router-dom';

const HitherJobMonitorControl = ({
    allJobs, pendingJobs, runningJobs, finishedJobs, erroredJobs, dispatch
}) => {
    setDispatch(dispatch);
    const numRunning = runningJobs.length;
    const numFinished = finishedJobs.length;
    const numErrored = erroredJobs.length;
    const title = `Jobs: ${numRunning} running | ${numFinished} finished | ${numErrored} errored`
    return (
        <Link to="/hitherJobMonitor" style={{color: 'white'}} title={title}>
            <span style={{fontFamily: "courier"}}>{numRunning}:{numFinished}:{numErrored}</span>
        </Link>
    );
}

const mapStateToProps = state => ({
    allJobs: state.hitherJobs,
    pendingJobs: state.hitherJobs.filter(j => (j.status === 'pending')),
    runningJobs: state.hitherJobs.filter(j => (j.status === 'running')),
    finishedJobs: state.hitherJobs.filter(j => (j.status === 'finished')),
    erroredJobs: state.hitherJobs.filter(j => (j.status === 'error')),
})

const mapDispatchToProps = dispatch => ({
    dispatch
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HitherJobMonitorControl);