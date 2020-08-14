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
  globalData.hitherJobs[msg.job_id] = job;
  delete globalData.hitherJobs[job.clientJobId];
  job.jobId = msg.job_id;
  if (job.status === 'pending') {
    job.status = 'running'; // not really running, but okay for now
    globalData.runningJobIds[job.jobId] = true;
  }
}

export const handleHitherJobCreationError = (msg) => {
  if (!(msg.client_job_id in globalData.hitherJobs)) {
    console.warn('Unable to find job with clientJobId (hitherJobCreationError).');
    return;
  }
  const job = globalData.hitherJobs[msg.client_job_id];
  job.status = 'error';
  job.error_message = `Error creating job ${job.functionName}: ${msg.error}`;
  delete globalData.hitherJobs[job.clientJobId];
}

export const handleHitherJobFinished = (msg) => {
  const job = globalData.hitherJobs[msg.job_id] || globalData.hitherJobs[msg.client_job_id];
  if (!job) {
    console.warn(`job not found (handleHitherJobFinished): ${msg.job_id} ${msg.client_job_id}`);
    return;
  }
  job.result = msg.result;
  job.runtime_info = msg.runtime_info;
  job.status = 'finished';
  if (job.jobId in globalData.runningJobIds) {
    delete globalData.runningJobIds[job.jobId];
  }
  dispatchUpdateHitherJob({jobId: job.jobId, job});
}

export const handleHitherJobError = (msg) => {
  const job = globalData.hitherJobs[msg.job_id] || globalData.hitherJobs[msg.client_job_id];
  if (!job) {
    console.warn(`job not found (handleHitherJobError): ${msg.job_id} ${msg.client_job_id}`);
    return;
  }
  job.error_message = msg.error_message;
  job.runtime_info = msg.runtime_info;
  job.status = 'error';
  if (job.jobId in globalData.runningJobIds) {
    delete globalData.runningJobIds[job.jobId];
  }
  dispatchUpdateHitherJob({jobId: job.jobId, job});
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
  const clientJobId = randomString(10) + '-client';
  const job = {
    clientJobId,
    jobId: null, // not known yet
    jobHash: jobHash,
    functionName,
    kwargs,
    opts,
    result: null,
    runtime_info: null,
    error_message: null,
    status: 'pending'
  }
  job.wait = async (timeout=undefined) => {
    while (true) {
      if (job.status === 'finished') {
        return job.result;
      }
      else if (job.status === 'error') {
        throw new Error(`Job error: ${job.error_message}`);
      }
      else {
        await sleepMsec(10);
      }
    } 
  }
  job.cancel = async () => {
    if (!job.jobId) {
      console.warn('Cannot cancel job that has not yet been created on the server.');
      return;
    }
    globalData.apiConnection.sendMessage({
      type: 'hitherCancelJob',
      job_id: job.jobId
    });
  }
  if (opts.useClientCache) {
    globalData.hitherClientJobCache[job.jobHash] = job;
  }
  globalData.hitherJobs[clientJobId] = job;
  globalData.apiConnection.sendMessage({
    type: 'hitherCreateJob',
    functionName,
    kwargs,
    opts,
    clientJobId
  })
  while (job.status === 'pending') {
    // wait for job to be created on the server
    await sleepMsec(20);
  }
  dispatchAddHitherJob(job);
  return job;
}

function randomString(num_chars) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < num_chars; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

export default createHitherJob;