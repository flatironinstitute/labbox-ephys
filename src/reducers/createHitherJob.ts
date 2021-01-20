import { CalculationPool, HitherJob } from '../extensions/common/hither';

const objectHash = require('object-hash');

interface ApiConnection {
  sendMessage: (msg: any) => void
}

const globalData: {
  // dispatch: Dispatch<RootAction> | null,
  apiConnection: ApiConnection | null,
  hitherClientJobCache: {[key: string]: ClientHitherJob},
  hitherJobs: {[key: string]: ClientHitherJob}
  runningJobIds: {[key: string]: boolean}
} = {
  // dispatch: null,
  apiConnection: null,
  hitherClientJobCache:{},
  hitherJobs: {},
  runningJobIds: {}
};

interface HitherJobCreatedMessageFromServer {
  client_job_id: string
  job_id: string
}

const handleHitherJobCreated = (msg: HitherJobCreatedMessageFromServer) => {
  if (!(msg.client_job_id in globalData.hitherJobs)) {
    console.warn(`Unable to find job with clientJobId: ${msg.client_job_id}.`);
    return;
  }
  const job = globalData.hitherJobs[msg.client_job_id];
  job._handleHitherJobCreated({jobId: msg.job_id});
  globalData.hitherJobs[msg.job_id] = job;
  delete globalData.hitherJobs[job.clientJobId()];
  // dispatchAddHitherJob(job.object());
}

const handleHitherJobCreationError = (msg: any) => {
  if (!(msg.client_job_id in globalData.hitherJobs)) {
    console.warn('Unable to find job with clientJobId (hitherJobCreationError).');
    return;
  }
  const job = globalData.hitherJobs[msg.client_job_id];
  const errorString = `Error creating job ${job._object.functionName}: ${msg.error}`;
  job._handleHitherJobError({
    errorString,
    runtime_info: null
  });
  delete globalData.hitherJobs[job.clientJobId()];
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
  job._handleHitherJobFinished({
    result: msg.result,
    runtime_info: msg.runtime_info
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

// const dispatchAddHitherJob = (job: HitherJob) => {
//   if (!globalData.dispatch) {
//     console.warn(`Unexpected: globalData.dispatch has not been set.`)
//     return;
//   }
//   globalData.dispatch(addHitherJob(job));
// }

// const dispatchUpdateHitherJob = (args: { clientJobId: string, update: HitherJobUpdate} ) => {
//   if (!globalData.dispatch) return;
//   globalData.dispatch(updateHitherJob(args));
// }

// export const setDispatch = (dispatch: Dispatch<RootAction>) => {
//   globalData.dispatch = dispatch;
// }

const setApiConnection = (apiConnection: ApiConnection) => {
  globalData.apiConnection = apiConnection;
}


class ClientHitherJob {
  _object: {
    functionName: string
    kwargs: {[key: string]: any}
    opts: HitherJobOpts
    clientJobId: string
    jobId: string | null
    result: any | null
    runtime_info: any | null
    error_message: any | null
    status: string
    timestampStarted: number
    timestampFinished: number | null
    clientCancelled: boolean
    wait: () => Promise<any>
    cancel: () => void
  }
  _onFinishedCallbacks: ((result: any) => void)[]
  _onErrorCallbacks: ((err: Error) => void)[]
  constructor(args: {functionName: string, kwargs: {[key: string]: any}, opts: HitherJobOpts}) {
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
      wait: async () => {return await this.wait()},
      cancel: () => {this.cancel()}
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
    const apiConnection = globalData.apiConnection
    if (!apiConnection) return
    apiConnection.sendMessage({
      type: 'hitherCancelJob',
      job_id: this._object.jobId
    });
  }
  onFinished(cb: (result: any) => void) {
    this._object.timestampFinished = Number(new Date())
    this._onFinishedCallbacks.push(cb);
    if (this._object.status === 'finished') {
      cb(this._object.result);
    }
  }
  onError(cb: (err: Error) => void) {
    this._object.timestampFinished = Number(new Date())
    this._onErrorCallbacks.push(cb);
    if (this._object.status === 'error') {
      cb(new Error(this._object.error_message));
    }
  }
  _handleHitherJobCreated(a: {jobId: string}) {
    this._object.jobId = a.jobId;
    if (this._object.status === 'pending') {
      this._object.status = 'running'; // not really running, but okay for now
      globalData.runningJobIds[this._object.jobId] = true;
    }
  }
  _handleHitherJobError(args: {errorString: string, runtime_info: any | null}) {
    this._object.status = 'error';
    this._object.error_message = args.errorString;
    this._object.runtime_info = args.runtime_info
    this._onErrorCallbacks.forEach(cb => cb(new Error(this._object.error_message)));
    if ((this._object.jobId) && (this._object.jobId in globalData.runningJobIds)) {
      delete globalData.runningJobIds[this._object.jobId];
    }
  }
  _handleHitherJobFinished(a: {result: any, runtime_info: any}) {
    this._object.result = a.result;
    this._object.runtime_info = a.runtime_info;
    this._object.status = 'finished';
    if ((this._object.jobId) && (this._object.jobId in globalData.runningJobIds)) {
      delete globalData.runningJobIds[this._object.jobId];
    }
    this._onFinishedCallbacks.forEach(cb => cb(this._object.result));
  }
}

interface HitherJobOpts {
  useClientCache?: boolean
  calculationPool?: CalculationPool
}

function randomString(num_chars: number) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < num_chars; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

// export default createHitherJob;