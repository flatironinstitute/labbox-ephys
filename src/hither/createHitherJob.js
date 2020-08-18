import File from './File'
import { addHitherJob, updateHitherJob } from '../actions/hitherJobs'

const objectHash = require('object-hash');

const globalData = {
  dispatch: null,
  apiConnection: null,
  hitherClientJobCache: {},
  hitherJobs: {},
  runningJobIds: {}
};

export const sleepMsec = m => new Promise(r => setTimeout(r, m));

export const handleHitherJobCreated = (msg) => {
  if (!(msg.client_job_id in globalData.hitherJobs)) {
    console.warn(`Unable to find job with clientJobId: ${msg.client_job_id}.`);
    return;
  }
  const job = globalData.hitherJobs[msg.client_job_id];
  job._handleHitherJobCreated({jobId: msg.job_id});
  globalData.hitherJobs[msg.job_id] = job;
  delete globalData.hitherJobs[job.clientJobId];
  dispatchAddHitherJob(job.object());
}

export const handleHitherJobCreationError = (msg) => {
  if (!(msg.client_job_id in globalData.hitherJobs)) {
    console.warn('Unable to find job with clientJobId (hitherJobCreationError).');
    return;
  }
  const job = globalData.hitherJobs[msg.client_job_id];
  const errorString = `Error creating job ${job._functionName}: ${msg.error}`;
  job._handleHitherJobCreationError({
    errorString,
    runtime_info: null
  });
  delete globalData.hitherJobs[job.clientJobId];
}

export const handleHitherJobFinished = (msg) => {
  const job = globalData.hitherJobs[msg.job_id] || globalData.hitherJobs[msg.client_job_id];
  if (!job) {
    console.warn(`job not found (handleHitherJobFinished): ${msg.job_id} ${msg.client_job_id}`);
    return;
  }
  job._handleHitherJobFinished({
    result: msg.result,
    runtime_info: msg.runtime_info
  })
  dispatchUpdateHitherJob({jobId: job._jobId, update: job.object()});
}

export const handleHitherJobError = (msg) => {
  const job = globalData.hitherJobs[msg.job_id] || globalData.hitherJobs[msg.client_job_id];
  if (!job) {
    console.warn(`job not found (handleHitherJobError): ${msg.job_id} ${msg.client_job_id}`);
    return;
  }
  job._handleHitherJobError({
    errorString: msg.error_message,
    runtime_info: msg.runtime_info
  })
  dispatchUpdateHitherJob({jobId: job._jobId, update: job.object()});
}

const dispatchAddHitherJob = (job) => {
  if (!globalData.dispatch) return;
  globalData.dispatch(addHitherJob(job));
}

const dispatchUpdateHitherJob = ({ jobId, update} ) => {
  if (!globalData.dispatch) return;
  globalData.dispatch(updateHitherJob({ jobId, update }));
}

export const setDispatch = (dispatch) => {
  globalData.dispatch = dispatch;
}

export const setApiConnection = (apiConnection) => {
  globalData.apiConnection = apiConnection;
}

class ClientHitherJob {
  constructor({functionName, kwargs, opts}) {
    this._functionName = functionName;
    this._kwargs = kwargs;
    this._opts = opts;
    this._clientJobId = randomString(10) + '-client';
    this._jobId = null; // not known yet
    this._result = null;
    this._runtime_info = null;
    this._error_message = null;
    this._status = 'pending';
    this._onFinishedCallbacks = [];
    this._onErrorCallbacks = [];
  }
  object() {
    return {
      jobId: this._jobId,
      kwargs: this._kwargs,
      opts: this._opts,
      clientJobId: this._clientJobId,
      result: this._result,
      runtime_info: this._runtime_info,
      error_message: this._error_message,
      status: this._status
    };
  }
  async wait() {
    return new Promise((resolve, reject) => {
      this.onFinished((result) => {
        resolve(result);
      });
      this.onError(err => {
        reject(err);
      });
    });
  }
  cancel() {
    if (!this._jobId) {
      console.warn('Cannot cancel job that has not yet been created on the server.');
      return;
    }
    globalData.apiConnection.sendMessage({
      type: 'hitherCancelJob',
      job_id: this._jobId
    });
  }
  onFinished(cb) {
    this._onFinishedCallbacks.push(cb);
    if (this._status === 'finished') {
      cb(this._result);
    }
  }
  onError(cb) {
    this._onErrorCallbacks.push(cb);
    if (this._status === 'error') {
      cb(new Error(this._error_message));
    }
  }
  _handleHitherJobCreated({jobId}) {
    this._jobId = jobId;
    if (this._status === 'pending') {
      this._status = 'running'; // not really running, but okay for now
      globalData.runningJobIds[this._jobId] = true;
    }
  }
  _handleHitherJobError({errorString}) {
    this._status = 'error';
    this._error_message = errorString;
    this._onErrorCallbacks.forEach(cb => cb(new Error(this._error_message)));
    if (this._jobId in globalData.runningJobIds) {
      delete globalData.runningJobIds[this._jobId];
    }
  }
  _handleHitherJobFinished({result, runtime_info}) {
    this._result = result;
    this._runtime_info = runtime_info;
    this._status = 'finished';
    if (this._jobId in globalData.runningJobIds) {
      delete globalData.runningJobIds[this._jobId];
    }
    this._onFinishedCallbacks.forEach(cb => cb(this._result));
  }
}

const createHitherJob = async (functionName, kwargs, opts={}) => {
  if (opts.wait) {
    const job0 = await createHitherJob(functionName, kwargs, {...opts, wait: false});
    return await job0.wait();
  }
  const jobHash = objectHash({
    functionName: functionName,
    kwargs,
    opts: opts
  });
  if (opts.useClientCache) {
    const existingJob = globalData.hitherClientJobCache[jobHash];
    if (existingJob) return existingJob;
  }
  const J = new ClientHitherJob({functionName, kwargs, opts});
  globalData.hitherJobs[J._clientJobId] = J;

  if (opts.useClientCache) {
    globalData.hitherClientJobCache[jobHash] = J;
  }

  globalData.apiConnection.sendMessage({
    type: 'hitherCreateJob',
    functionName: J._functionName,
    kwargs: J._kwargs,
    opts: J._opts,
    clientJobId: J._clientJobId
  })

  return J;
}

function randomString(num_chars) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < num_chars; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

export default createHitherJob;