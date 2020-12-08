import { Dispatch } from 'react';
import { addHitherJob, updateHitherJob } from '../actions/hitherJobs';
import { HitherJob } from '../extensions/extensionInterface';
import { RootAction } from '../reducers';
import { HitherJobUpdate } from '../reducers/hitherJobs';

const objectHash = require('object-hash');

interface ApiConnection {
  sendMessage: (msg: any) => void
}

const globalData: {
  dispatch: Dispatch<RootAction> | null,
  apiConnection: ApiConnection | null,
  hitherClientJobCache: {[key: string]: ClientHitherJob},
  hitherJobs: {[key: string]: ClientHitherJob}
  runningJobIds: {[key: string]: boolean}
} = {
  dispatch: null,
  apiConnection: null,
  hitherClientJobCache:{},
  hitherJobs: {},
  runningJobIds: {}
};

interface HitherJobCreatedMessageFromServer {
  client_job_id: string
  job_id: string
}

export const handleHitherJobCreated = (msg: HitherJobCreatedMessageFromServer) => {
  if (!(msg.client_job_id in globalData.hitherJobs)) {
    console.warn(`Unable to find job with clientJobId: ${msg.client_job_id}.`);
    return;
  }
  const job = globalData.hitherJobs[msg.client_job_id];
  job._handleHitherJobCreated({jobId: msg.job_id});
  globalData.hitherJobs[msg.job_id] = job;
  delete globalData.hitherJobs[job.clientJobId()];
  dispatchAddHitherJob(job.object());
}

export const handleHitherJobCreationError = (msg: any) => {
  if (!(msg.client_job_id in globalData.hitherJobs)) {
    console.warn('Unable to find job with clientJobId (hitherJobCreationError).');
    return;
  }
  const job = globalData.hitherJobs[msg.client_job_id];
  const errorString = `Error creating job ${job._functionName}: ${msg.error}`;
  job._handleHitherJobError({
    errorString,
    runtime_info: null
  });
  delete globalData.hitherJobs[job.clientJobId()];
}

export const handleHitherJobFinished = (msg: any) => {
  const job = globalData.hitherJobs[msg.job_id] || globalData.hitherJobs[msg.client_job_id];
  if (!job) {
    console.warn(`job not found (handleHitherJobFinished): ${msg.job_id} ${msg.client_job_id}`);
    return;
  }
  if (!job._jobId) {
    console.warn(`No _jobId for job`);
    return;
  }
  job._handleHitherJobFinished({
    result: msg.result,
    runtime_info: msg.runtime_info
  })
  dispatchUpdateHitherJob({jobId: job._jobId, update: job.object()});
}

export const handleHitherJobError = (msg: any) => {
  const job = globalData.hitherJobs[msg.job_id] || globalData.hitherJobs[msg.client_job_id];
  if (!job) {
    console.warn(`job not found (handleHitherJobError): ${msg.job_id} ${msg.client_job_id}`);
    return;
  }
  const jobId = job._jobId
  if (!jobId) {
    console.warn(`no _jobId (handleHitherJobError): ${msg.job_id} ${msg.client_job_id}`);
    return;
  }
  job._handleHitherJobError({
    errorString: msg.error_message,
    runtime_info: msg.runtime_info
  })
  dispatchUpdateHitherJob({jobId, update: job.object()});
}

const dispatchAddHitherJob = (job: HitherJob) => {
  if (!globalData.dispatch) {
    console.warn(`Unexpected: globalData.dispatch has not been set.`)
    return;
  }
  globalData.dispatch(addHitherJob(job));
}

const dispatchUpdateHitherJob = (args: { jobId: string, update: HitherJobUpdate} ) => {
  if (!globalData.dispatch) return;
  globalData.dispatch(updateHitherJob(args));
}

export const setDispatch = (dispatch: Dispatch<RootAction>) => {
  globalData.dispatch = dispatch;
}

export const setApiConnection = (apiConnection: ApiConnection) => {
  globalData.apiConnection = apiConnection;
}


class ClientHitherJob {
  _functionName: string
  _kwargs: {[key: string]: any}
  _opts: HitherJobOpts
  _clientJobId: string
  _jobId: string | null
  _result: any | null
  _runtime_info: any | null
  _error_message: any | null
  _status: string
  _onFinishedCallbacks: ((result: any) => void)[]
  _onErrorCallbacks: ((err: Error) => void)[]
  _timestampStarted: number
  _timestampFinished: number | null
  _wait = async () => {return await this.wait()}
  constructor(args: {functionName: string, kwargs: {[key: string]: any}, opts: HitherJobOpts}) {
    this._functionName = args.functionName;
    this._kwargs = args.kwargs;
    this._opts = args.opts
    this._clientJobId = randomString(10) + '-client';
    this._jobId = null; // not known yet
    this._result = null;
    this._runtime_info = null;
    this._error_message = null;
    this._status = 'pending';
    this._onFinishedCallbacks = [];
    this._onErrorCallbacks = [];
    this._timestampStarted = Number(new Date())
    this._timestampFinished = null
  }
  object() {
    const ret: HitherJob = {
      jobId: this._jobId,
      functionName: this._functionName,
      kwargs: this._kwargs,
      opts: this._opts,
      clientJobId: this._clientJobId,
      result: this._result,
      runtime_info: this._runtime_info,
      error_message: this._error_message,
      status: this._status,
      timestampStarted: this._timestampStarted,
      timestampFinished: this._timestampFinished,
      wait: this._wait
    }
    return ret
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
    return this._clientJobId
  }
  cancel() {
    if (!this._jobId) {
      console.warn('Cannot cancel job that has not yet been created on the server.');
      return;
    }
    const apiConnection = globalData.apiConnection
    if (!apiConnection) return
    apiConnection.sendMessage({
      type: 'hitherCancelJob',
      job_id: this._jobId
    });
  }
  onFinished(cb: (result: any) => void) {
    this._timestampFinished = Number(new Date())
    this._onFinishedCallbacks.push(cb);
    if (this._status === 'finished') {
      cb(this._result);
    }
  }
  onError(cb: (err: Error) => void) {
    this._timestampFinished = Number(new Date())
    this._onErrorCallbacks.push(cb);
    if (this._status === 'error') {
      cb(new Error(this._error_message));
    }
  }
  _handleHitherJobCreated(a: {jobId: string}) {
    this._jobId = a.jobId;
    if (this._status === 'pending') {
      this._status = 'running'; // not really running, but okay for now
      globalData.runningJobIds[this._jobId] = true;
    }
  }
  _handleHitherJobError(args: {errorString: string, runtime_info: any | null}) {
    this._status = 'error';
    this._error_message = args.errorString;
    this._runtime_info = args.runtime_info
    this._onErrorCallbacks.forEach(cb => cb(new Error(this._error_message)));
    if ((this._jobId) && (this._jobId in globalData.runningJobIds)) {
      delete globalData.runningJobIds[this._jobId];
    }
  }
  _handleHitherJobFinished(a: {result: any, runtime_info: any}) {
    this._result = a.result;
    this._runtime_info = a.runtime_info;
    this._status = 'finished';
    if ((this._jobId) && (this._jobId in globalData.runningJobIds)) {
      delete globalData.runningJobIds[this._jobId];
    }
    this._onFinishedCallbacks.forEach(cb => cb(this._result));
  }
}

interface HitherJobOpts {
  useClientCache?: boolean,
  newHitherJobMethod?: boolean,
  job_handler_name?: string,
  auto_substitute_file_objects?: boolean,
  hither_config?: {
    use_job_cache: boolean
  },
  required_files?: any
}

const createHitherJob = (functionName: string, kwargs: {[key: string]: any}, opts: HitherJobOpts): HitherJob => {
  const jobHash = objectHash({
    functionName: functionName,
    kwargs,
    opts: opts
  });
  if (opts.useClientCache) {
    const existingJob = globalData.hitherClientJobCache[jobHash];
    if (existingJob) return existingJob.object()
  }
  const J = new ClientHitherJob({functionName, kwargs, opts});
  globalData.hitherJobs[J._clientJobId] = J;

  if (opts.useClientCache) {
    globalData.hitherClientJobCache[jobHash] = J;
  }
  const apiConnection = globalData.apiConnection
  if (!apiConnection) {
    throw Error('Cannot create hither job with no API connection')
  }

  apiConnection.sendMessage({
    type: 'hitherCreateJob',
    functionName: J._functionName,
    kwargs: J._kwargs,
    opts: J._opts,
    clientJobId: J._clientJobId
  })

  return J.object()
}

function randomString(num_chars: number) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < num_chars; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

export default createHitherJob;