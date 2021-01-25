import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HitherContext, HitherJob } from '../../extensions/common/hither';
import { getPathQuery } from '../../kachery';
import { WorkspaceInfo } from '../../reducers/workspaceInfo';

type Props = {
    workspaceInfo: WorkspaceInfo,
    websocketStatus: string
}

const HitherJobMonitorControl: FunctionComponent<Props> = ({ workspaceInfo, websocketStatus }) => {
    const [hitherJobs, setHitherJobs] = useState<HitherJob[]>([])
    const hither = useContext(HitherContext)
    useEffect(() => {
        // this should only get called once
        // (hither should not change, but if it does we might have a problem here)
        const timer1 = setInterval(() => {
            const hj = hither.getHitherJobs()
            setHitherJobs(hj)
        }, 1000)
        return () => {
            clearInterval(timer1)
        }
    }, [hither])

    const { allJobs, pendingJobs, runningJobs, finishedJobs, erroredJobs } = {
        allJobs: hitherJobs,
        pendingJobs: hitherJobs.filter(j => (j.status === 'pending')),
        runningJobs: hitherJobs.filter(j => (j.status === 'running')),
        finishedJobs: hitherJobs.filter(j => (j.status === 'finished')),
        erroredJobs: hitherJobs.filter(j => (j.status === 'error')),
    }
    const { workspaceName, feedUri } = workspaceInfo;
    const numRunning = runningJobs.length;
    const numFinished = finishedJobs.length;
    const numErrored = erroredJobs.length;
    const title = `Jobs: ${numRunning} running | ${numFinished} finished | ${numErrored} errored`
    return (
        <Link to={`/${workspaceName}/hitherJobMonitor${getPathQuery({ feedUri })}`} style={{ color: 'white' }} title={title}>
            <span style={{ fontFamily: "courier", backgroundColor: (websocketStatus === 'connected') ? '' : 'red' }}>{numRunning}:{numFinished}:{numErrored}</span>
        </Link>
    );
}

export default HitherJobMonitorControl