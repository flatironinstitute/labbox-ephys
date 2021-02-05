import { CalculationPool } from "."


export interface HitherJobOpts {
    useClientCache?: boolean
    calculationPool?: CalculationPool
}

export interface HitherJob {
    jobId: string | null
    functionName: string
    kwargs: {[key: string]: any}
    opts: HitherJobOpts
    clientJobId: string
    result: any
    runtime_info: {[key: string]: any}
    error_message: string | null
    status: 'pending' | 'running' | 'finished' | 'error'
    timestampStarted: number
    timestampFinished: number | null
    clientCancelled: boolean
    wait: () => Promise<any>
    cancel: () => void
}

export const dummyHitherJob: HitherJob = {
    jobId: null,
    functionName: '',
    kwargs: {},
    opts: {},
    clientJobId: '',
    result: null,
    runtime_info: {},
    error_message: null,
    status: 'pending',
    timestampStarted: 0,
    timestampFinished: null,
    clientCancelled: false,
    wait: async () => {},
    cancel: () => {}
}

export interface HitherInterface {
    createHitherJob: (functionName: string, kwargs: {[key: string]: any}, opts: HitherJobOpts) => HitherJob
    getHitherJobs: () => HitherJob[]
}

export const dummyHitherInterface: HitherInterface = {
    createHitherJob: (functionName: string, kwargs: {[key: string]: any}, opts: HitherJobOpts) => (dummyHitherJob),
    getHitherJobs: (): HitherJob[] => []
}