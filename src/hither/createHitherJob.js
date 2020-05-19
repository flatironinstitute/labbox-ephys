import File from './File'
import { addHitherJob, updateHitherJob } from '../actions/hitherJobs'

const axios = require('axios');
const objectHash = require('object-hash');

const globalHitherJobStore = {};
const globalDispatch = {};

export const sleepMsec = m => new Promise(r => setTimeout(r, m));

const dispatchAddHitherJob = (job) => {
  if (!globalDispatch.dispatch) return;
  globalDispatch.dispatch(addHitherJob(job));
}

const dispatchUpdateHitherJob = ({ jobId, update} ) => {
  if (!globalDispatch.dispatch) return;
  globalDispatch.dispatch(updateHitherJob({ jobId, update }));
}

export const setDispatch = (dispatch) => {
  globalDispatch.dispatch = dispatch;
}

const createHitherJob = async (functionName, kwargs, opts={}) => {
  if (opts.wait) {
    const job0 = await createHitherJob(functionName, kwargs, {...opts, wait: false});
    return await job0.wait();
  }
  const kwargs2 = serializeFileObjectsInItem(kwargs);
  const jobHash = objectHash({
    functionName: functionName,
    kwargs: kwargs2,
    opts: opts
  });
  if (opts.useClientCache) {
    const existingJob = globalHitherJobStore[jobHash];
    if (existingJob) return existingJob;
  }
  const job = {
    jobHash: jobHash,
    functionName: functionName,
    kwargs: kwargs2,
    opts: opts,
    result: null,
    runtime_info: null,
    status: 'pending'
  }
  job.wait = async (timeout=undefined) => {
    while (true) {
      while ((!job.jobId) && (job.status === 'pending')) {
        // the api call must be happening elsewhere
        await sleepMsec(10);
      }
      if (job.status === 'finished') {
        return job.result;
      }
      else if (job.status === 'error') {
        throw Error(job.errorMessage);
      }
      else if (job.status === 'pending') {
        job.status = 'running';
        job.timestampStarted = (new Date()).getTime();
        dispatchUpdateHitherJob({jobId: job.jobId, update: job});
        const timer = new Date();
        while (true) {
          const ret = await job._wait_helper();
          if (!ret.timeout) {
            if (job.status === 'error') {
              throw Error(job.errorMessage);
            }  
            else if (job.status === 'finished') {
              return job.result;
            }
            else {
              throw Error(`Unexpected status after returning from job._wait_helper: ${job.status}`)
            }
          }
          const elapsed = (new Date() - timer);
          if ((timeout !== undefined) && (elapsed > timeout)) {
            return null;
          }
          await sleepMsec(100);
        }
      }
      else {
        await sleepMsec(50);
      }
    }
    
  }
  job._wait_helper = async () => {
    let data;
    try {
      const url = `/api/hither_job_wait`;
      const result = await axios.post(url, {job_id: job.jobId, timeout_sec: 5});
      data = result.data;
    }
    catch (err) {
      job.status = 'error';
      job.errorMessage = 'Error calling hitherJobWait';
      dispatchUpdateHitherJob({jobId: job.jobId, update: job});
      return {
        timeout: false
      };
    }
    if (!data) {
      job.status = 'error';
      job.errorMessage = 'Unexpected: No data';
      dispatchUpdateHitherJob({jobId: job.jobId, update: job});
      return {
        timeout: false
      };
    }
    else if (data.error) {
      job.status = 'error';
      job.errorMessage = `Error running job: ${data.error_message}`;
      job.runtime_info = data.runtime_info;
      dispatchUpdateHitherJob({jobId: job.jobId, update: job});
      return {
        timeout: false
      };
    }
    else if (data.timeout) {
      return {timeout: true};
    }
    else {
      job.status = 'finished';
      job.result = deserializeFileObjectsInItem(data.result);
      job.runtime_info = data.runtime_info;
      dispatchUpdateHitherJob({jobId: job.jobId, update: job});
      return {
        timeout: false
      };
    }
  }
  job.cancel = async () => {
    const url = `/api/hither_job_cancel`;
    await axios.post(url, {job_id: job.jobId});
  }
  if (opts.useClientCache) {
    globalHitherJobStore[job.jobHash] = job;
  }
  let j;
  try {
    j = await axios.post('/api/create_hither_job', job);
  }
  catch(err) {
    job.status = 'error';
    job.errorMessage = 'Error running job.';
    throw(err);
  }
  job.jobId = j.data.job_id;
  dispatchAddHitherJob(job);
  return job;
}

function serializeFileObjectsInItem(x) {
  if (!x) return x;
  if (typeof(x) === 'object') {
    if (Array.isArray(x)) {
      let ret = [];
      for (let elmt of x) {
        ret.push(serializeFileObjectsInItem(elmt));
      }
      return ret;
    }
    else if (x instanceof File) {
      return x.serialize();
    }
    else {
      let ret = {};
      for (let key in x) {
        ret[key] = serializeFileObjectsInItem(x[key]);
      }
      return ret;
    }
  }
  else {
    return x;
  }
}

function deserializeFileObjectsInItem(x) {
  if (!x) return x;
  if (typeof(x) === 'object') {
    if (Array.isArray(x)) {
      let ret = [];
      for (let elmt of x) {
        ret.push(deserializeFileObjectsInItem(elmt));
      }
      return ret;
    }
    else if ((x._type) && (x._type === '_hither_file')) {
      return File.deserialize(x);
    }
    else {
      let ret = {};
      for (let key in x) {
        ret[key] = deserializeFileObjectsInItem(x[key]);
      }
      return ret;
    }
  }
  else {
    return x;
  }
}

export default createHitherJob;