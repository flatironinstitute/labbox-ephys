import { HitherContext, HitherJob } from 'labbox';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import Hyperlink from '../../../common/Hyperlink';

type Props = {
    onClick?: () => void
}

export const useMonitorHitherJobs = () => {
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

    return {
        pendingJobs: hitherJobs.filter(j => (j.status === 'pending')),
        runningJobs: hitherJobs.filter(j => (j.status === 'running')),
        finishedJobs: hitherJobs.filter(j => (j.status === 'finished')),
        erroredJobs: hitherJobs.filter(j => (j.status === 'error')),
        allJobs: hitherJobs
    }
}

const HitherJobMonitorControl: FunctionComponent<Props> = ({ onClick }) => {
    const { pendingJobs, runningJobs, finishedJobs, erroredJobs } = useMonitorHitherJobs()

    const numPending = pendingJobs.length;
    const numRunning = runningJobs.length;
    const numFinished = finishedJobs.length;
    const numErrored = erroredJobs.length;
    const title = `Jobs: ${numPending} pending | ${numRunning} running | ${numFinished} finished | ${numErrored} errored`
    const errored = numErrored > 0 ? (
        <span>:<span style={{color: 'pink'}}>{numErrored}</span></span>
    ) : <span></span>
    return (
        <Hyperlink onClick={onClick} color="white" >
            <span title={title} style={{ fontFamily: "courier" }}>{numPending}:{numRunning}:{numFinished}{errored}</span>
        </Hyperlink>
    );
}

export default HitherJobMonitorControl