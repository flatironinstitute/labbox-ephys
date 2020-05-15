import File from './File'
import { addHitherJob, updateHitherJob } from '../actions/hitherJobs'

const axios = require('axios');
const objectHash = require('object-hash');

const globalHitherJobStore = {};
const globalDispatch = {};

export const sleep = m => new Promise(r => setTimeout(r, m));

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
  if (opts.useCache !== false) {
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
  job.wait = async () => {
    while (true) {
      while ((!job.jobId) && (job.status === 'pending')) {
        // the api call must be happening elsewhere
        await sleep(10);
      }
      if (job.status === 'finished') {
        return job.result;
      }
      else if (job.status === 'error') {
        throw Error(job.errorMessage);
      }
      else if (job.status === 'pending') {
        job.status = 'running';
        dispatchUpdateHitherJob({jobId: job.jobId, update: job});
        let data;
        try {
          const url = `/api/hither_job_wait`;
          const result = await axios.post(url, {job_id: job.jobId});
          data = result.data;
        }
        catch (err) {
          job.status = 'error';
          job.errorMessage = 'Error calling hitherJobWait';
          dispatchUpdateHitherJob({jobId: job.jobId, update: job});
          break;
        }
        if (!data) {
          job.status = 'error';
          job.errorMessage = 'Unexpected: No data';
          dispatchUpdateHitherJob({jobId: job.jobId, update: job});
          break;
        }
        else if (data.error) {
          job.status = 'error';
          job.errorMessage = `Error running job: ${data.error_message}`;
          job.runtime_info = data.runtime_info;
          dispatchUpdateHitherJob({jobId: job.jobId, update: job});
          break;
        }
        else {
          job.status = 'finished';
          job.result = deserializeFileObjectsInItem(data.result);
          job.runtime_info = data.runtime_info;
          dispatchUpdateHitherJob({jobId: job.jobId, update: job});
        }
      }
      else {
        await sleep(50);
      }
    }
    throw Error(job.errorMessage);
  }
  if (opts.useCache !== false) {
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