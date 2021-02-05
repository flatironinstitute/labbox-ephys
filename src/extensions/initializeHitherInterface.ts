import axios from 'axios'
import objectHash from 'object-hash'
import { CalculationPool, createCalculationPool, HitherJob } from "./common/hither"

interface HitherJobOpts {
    useClientCache?: boolean
    calculationPool?: CalculationPool
}

const defaultCalculationPool = createCalculationPool({ maxSimultaneous: 20 })


type HitherCancelJobMessage = {
    type: 'hitherCancelJob',
    job_id: string
}
type HitherCreateJobMessage = {
    type: 'hitherCreateJob',
    functionName: string,
    kwargs: { [key: string]: any },
    clientJobId: string
}
export type HitherJobMessage = HitherCancelJobMessage | HitherCreateJobMessage

interface HitherJobCreatedMessageFromServer {
    client_job_id: string
    job_id: string
}

const initializeHitherInterface = (baseSha1Url: string) => {
    const globalData: {
        // dispatch: Dispatch<RootAction> | null,
        hitherClientJobCache: { [key: string]: ClientHitherJob },
        hitherJobs: { [key: string]: ClientHitherJob }
        runningJobIds: { [key: string]: boolean }
        sendMessage: (msg: HitherJobMessage) => void
    } = {
        // dispatch: null,
        hitherClientJobCache: {},
        hitherJobs: {},
        runningJobIds: {},
        sendMessage: (msg: HitherJobMessage) => {throw Error('sendMessage not registered for hither interface.')}
    };

    class ClientHitherJob {
        _object: {
            functionName: string
            kwargs: { [key: string]: any }
            opts: HitherJobOpts
            clientJobId: string
            jobId: string | null
            result: any | null
            runtime_info: any | null
            error_message: any | null
            status: 'pending' | 'running' | 'finished' | 'error'
            timestampStarted: number
            timestampFinished: number | null
            clientCancelled: boolean
            wait: () => Promise<any>
            cancel: () => void
        }
        _onFinishedCallbacks: ((result: any) => void)[]
        _onErrorCallbacks: ((err: Error) => void)[]
        constructor(args: { functionName: string, kwargs: { [key: string]: any }, opts: HitherJobOpts }) {
            this._object = {
                functionName: args.functionName,
                kwargs: args.kwargs,
                opts: args.opts,
                clientJobId: randomString(10) + '-client',
                jobId: null,
                result: null,
                runtime_info: null,
                error_message: null,
                status: 'pending',
                timestampStarted: Number(new Date()),
                timestampFinished: null,
                clientCancelled: false,
                wait: async () => { return await this.wait() },
                cancel: () => { this.cancel() }
            }
            this._onFinishedCallbacks = [];
            this._onErrorCallbacks = [];
        }
        object(): HitherJob {
            return this._object
        }
        async wait(): Promise<any> {
            return new Promise((resolve, reject) => {
                this.onFinished((result: any) => {
                    resolve(result);
                });
                this.onError((err: Error) => {
                    reject(err);
                });
            });
        }
        clientJobId() {
            return this._object.clientJobId
        }
        cancel() {
            if (!this._object.jobId) {
                console.warn('Cannot cancel job that has not yet been created on the server.');
                return;
            }
            globalData.sendMessage({
                type: 'hitherCancelJob',
                job_id: this._object.jobId
            });
        }
        onFinished(cb: (result: any) => void) {
            this._onFinishedCallbacks.push(cb);
            if (this._object.status === 'finished') {
                cb(this._object.result);
            }
        }
        onError(cb: (err: Error) => void) {
            this._onErrorCallbacks.push(cb);
            if (this._object.status === 'error') {
                cb(new Error(this._object.error_message));
            }
        }
        _handleHitherJobCreated(a: { jobId: string }) {
            this._object.jobId = a.jobId;
            if (this._object.status === 'pending') {
                this._object.status = 'running'; // not really running, but okay for now
                globalData.runningJobIds[this._object.jobId] = true;
            }
        }
        _handleHitherJobError(args: { errorString: string, runtime_info: any | null }) {
            this._object.timestampFinished = Number(new Date())
            this._object.status = 'error';
            this._object.error_message = args.errorString;
            this._object.runtime_info = args.runtime_info
            this._onErrorCallbacks.forEach(cb => cb(new Error(this._object.error_message)));
            if ((this._object.jobId) && (this._object.jobId in globalData.runningJobIds)) {
                delete globalData.runningJobIds[this._object.jobId];
            }
        }
        _handleHitherJobFinished(a: { result: any, runtime_info: any }) {
            this._object.timestampFinished = Number(new Date())
            this._object.result = processHitherJobResult(a.result);
            this._object.runtime_info = a.runtime_info;
            this._object.status = 'finished';
            if ((this._object.jobId) && (this._object.jobId in globalData.runningJobIds)) {
                delete globalData.runningJobIds[this._object.jobId];
            }
            this._onFinishedCallbacks.forEach(cb => cb(this._object.result));
        }
    }

    const createHitherJob = (functionName: string, kwargs: { [key: string]: any }, opts: HitherJobOpts): HitherJob => {
        const jobHash = objectHash({ functionName, kwargs, opts: { useClientCache: opts.useClientCache } }); // important: we exclude calculationPool in this hash
        if (opts.useClientCache) {
            const existingJob = globalData.hitherClientJobCache[jobHash];
            if (existingJob) return existingJob.object()
        }
        const J = new ClientHitherJob({ functionName, kwargs, opts });
        globalData.hitherJobs[J._object.clientJobId] = J;

        if (opts.useClientCache) {
            globalData.hitherClientJobCache[jobHash] = J;
        }

        (opts.calculationPool || defaultCalculationPool).requestSlot().then(({ complete }) => {
            J.onError(() => { complete() })
            J.onFinished(() => {
                complete()
            })
            globalData.sendMessage({
                type: 'hitherCreateJob',
                functionName: J._object.functionName,
                kwargs: J._object.kwargs,
                clientJobId: J._object.clientJobId
            })
        })

        return J.object()
    }
    const handleHitherJobFinished = (msg: any) => {
        const job = globalData.hitherJobs[msg.job_id] || globalData.hitherJobs[msg.client_job_id];
        if (!job) {
            console.warn(`job not found (handleHitherJobFinished): ${msg.job_id} ${msg.client_job_id}`);
            return;
        }
        if (!job._object.jobId) {
            console.warn(`No _jobId for job`);
            return;
        }
        const result_sha1 = msg.result_sha1
        // const url = `http://${window.location.hostname}:15309/sha1/${result_sha1}`;
        const url = `${baseSha1Url}/${result_sha1}`
        axios.get(url).then((result) => {
            job._handleHitherJobFinished({
                result: result.data,
                runtime_info: msg.runtime_info
            })
        })
            .catch((err: Error) => {
                job._handleHitherJobError({
                    errorString: `Problem retrieving result: ${err.message}`,
                    runtime_info: msg.runtime_info
                })
            })
        // dispatchUpdateHitherJob({clientJobId: job.clientJobId(), update: job.object()});
    }
    const handleHitherJobError = (msg: any) => {
        const job = globalData.hitherJobs[msg.job_id] || globalData.hitherJobs[msg.client_job_id];
        if (!job) {
            console.warn(`job not found (handleHitherJobError): ${msg.job_id} ${msg.client_job_id}`);
            return;
        }
        // const jobId = job._jobId
        // if (!jobId) {
        //   console.warn(`no _jobId (handleHitherJobError): ${msg.job_id} ${msg.client_job_id}`);
        //   return;
        // }
        job._handleHitherJobError({
            errorString: msg.error_message,
            runtime_info: msg.runtime_info
        })
        // dispatchUpdateHitherJob({clientJobId: job.clientJobId(), update: job.object()});
    }
    const handleHitherJobCreated = (msg: HitherJobCreatedMessageFromServer) => {
        if (!(msg.client_job_id in globalData.hitherJobs)) {
            console.warn(`Unable to find job with clientJobId: ${msg.client_job_id}.`);
            return;
        }
        const job = globalData.hitherJobs[msg.client_job_id];
        job._handleHitherJobCreated({ jobId: msg.job_id });
        globalData.hitherJobs[msg.job_id] = job;
        delete globalData.hitherJobs[job.clientJobId()];
        // dispatchAddHitherJob(job.object());
    }
    const getNumActiveJobs = () => {
        return Object.values(globalData.hitherJobs).filter(j => (!['finished', 'error'].includes(j._object.status))).length
    }
    const getHitherJobs = (): HitherJob[] => {
        return Object.values(globalData.hitherJobs).map(j => ({
            ...(j._object)
        }))
    }
    const _registerSendMessage = (sendMessage: (msg: HitherJobMessage) => void) => {
        globalData.sendMessage = sendMessage
    }
    return {
        _registerSendMessage,
        createHitherJob,
        handleHitherJobFinished,
        handleHitherJobError,
        handleHitherJobCreated,
        getNumActiveJobs,
        getHitherJobs
    }
}

const processHitherJobResult = (x: any): any => {
    if (typeof (x) === 'object') {
        if (Array.isArray(x)) {
            return x.map(a => processHitherJobResult(a))
        }
        else if (x._type === 'ndarray') {
            const shape = x.shape as number[]
            const dtype = x.dtype as string
            const data_b64 = x.data_b64 as string
            const dataBuffer = _base64ToArrayBuffer(data_b64)
            if (dtype === 'float32') {
                return applyShape(new Float32Array(dataBuffer), shape)
            }
            else if (dtype === 'int32') {
                return applyShape(new Int32Array(dataBuffer), shape)
            }
            else if (dtype === 'int16') {
                return applyShape(new Int16Array(dataBuffer), shape)
            }
            else {
                throw Error(`Datatype not yet implemented for ndarray: ${dtype}`)
            }
        }
        else {
            const ret: { [key: string]: any } = {}
            for (let k in x) {
                ret[k] = processHitherJobResult(x[k])
            }
            return ret
        }
    }
    else return x
}

const applyShape = (x: Float32Array | Int32Array | Int16Array, shape: number[]): number[] | number[][] => {
    if (shape.length === 1) {
        if (shape[0] !== x.length) throw Error('Unexpected length of array')
        return Array.from(x)
    }
    else if (shape.length === 2) {
        const n1 = shape[0]
        const n2 = shape[1]
        if (n1 * n2 !== x.length) throw Error('Unexpected length of array')
        const ret: number[][] = []
        for (let i1 = 0; i1 < n1; i1++) {
            ret.push(Array.from(x.slice(i1 * n2, (i1 + 1) * n2)))
        }
        return ret
    }
    else {
        throw Error('Not yet implemented')
    }
}

const _base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    var binary_string = window.atob(base64)
    var len = binary_string.length
    var bytes = new Uint8Array(len)
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i)
    }
    return bytes.buffer
}

function randomString(num_chars: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default initializeHitherInterface