import { useContext, useState } from "react";
import HitherContext from "./HitherContext";
import { dummyHitherJob, HitherJob, HitherJobOpts } from "./HitherInterface";

const useHitherJob = <T>(functionName: string, functionArgs: {[key: string]: any}, hitherJobOpts: HitherJobOpts): {result: T | undefined, job: HitherJob} => {
    const hither = useContext(HitherContext)
    const [state, setState] = useState<{
        status: 'pending' | 'running' | 'error' | 'finished',
        functionName: string,
        functionArgs: {[key: string]: any}
        hitherJobOpts: HitherJobOpts,
        job: HitherJob | null
    }>({status: 'pending', functionName: '', hitherJobOpts: {}, functionArgs: {}, job: null})

    const functionMatch = () => {
        if (functionName !== state.functionName) return false
        if (!deepCompare(functionArgs, state.functionArgs)) return false
        if (!deepCompare(hitherJobOpts, state.hitherJobOpts)) return false
        return true
    }

    if (!functionName) {
        return {result: undefined, job: dummyHitherJob}
    }

    if (!functionMatch()) {
        const job = hither.createHitherJob(functionName, functionArgs, hitherJobOpts)
        setState({
            status: 'running',
            functionName,
            functionArgs,
            hitherJobOpts,
            job
        })
        job.wait().then(() => {
            if (job.clientCancelled) return
            setState({
                status: 'finished',
                functionName,
                functionArgs,
                hitherJobOpts,
                job
            })
        })
        .catch((err: Error) => {
            if (job.clientCancelled) return
            setState({
                status: 'error',
                functionName,
                functionArgs,
                hitherJobOpts,
                job
            })
        })
        return {result: undefined, job}
    }
    // functionMatch() is true, i.e. the job is already being tracked. Return the record for it.
    if (!state.job) throw Error('Unexpected: job is not defined')
    let retrievedJob = {
        result: undefined,
        job: state.job
    }
    switch (state.status) {
        case 'finished':
            retrievedJob.result = state.job?.result
            break;
        // As of right now, for any other case we return the default set above.
        // Anticipate this might be more customized in the future.
        // eslint-disable-next-line no-fallthrough
        case 'running':
        case 'error':
        default:
            break;
    }
    return retrievedJob
}

function deepCompare(x: any, y: any) {
    if (x === y) return true
    if (Array.isArray(x)) {
        if (!Array.isArray(y)) return false
        if (x.length !== y.length) return false
        for (let i = 0; i < x.length; i++) {
            if (!deepCompare(x[i], y[i])) return false
        }
        return true
    }
    else if (typeof(x) === 'object') {
        if (typeof(y) !== 'object') return false
        for (let k in x) {
            if (!(k in y)) return false
            if (!deepCompare(x[k], y[k])) return false
        }
        for (let k in y) {
            if (!(k in x)) return false
        }
        return true
    }
    else return false
}

export default useHitherJob