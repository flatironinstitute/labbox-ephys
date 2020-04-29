const axios = require('axios');
const objectHash = require('object-hash');

export const ADD_COMPUTE_RESOURCE = 'ADD_COMPUTE_RESOURCE'
export const DELETE_COMPUTE_RESOURCE = 'DELETE_COMPUTE_RESOURCE'
export const RECEIVE_COMPUTE_RESOURCE_JOB_STATS = 'RECEIVE_COMPUTE_RESOURCE_JOB_STATS'
export const INIT_FETCH_COMPUTE_RESOURCE_JOB_STATS = 'INIT_FETCH_COMPUTE_RESOURCE_JOB_STATS'
export const RECEIVE_COMPUTE_RESOURCE_ACTIVE = 'RECEIVE_COMPUTE_RESOURCE_ACTIVE'
export const INIT_FETCH_COMPUTE_RESOURCE_ACTIVE = 'INIT_FETCH_COMPUTE_RESOURCE_ACTIVE'

export const SET_DATABASE_CONFIG = 'SET_DATABASE_CONFIG'

export const INIT_FETCH_RECORDING_INFO = 'INIT_FETCH_RECORDING_INFO'
export const RECEIVE_RECORDING_INFO = 'RECEIVE_RECORDING_INFO'

const sleep = m => new Promise(r => setTimeout(r, m))

export const addComputeResource = newComputeResource => ({
  type: ADD_COMPUTE_RESOURCE,
  newComputeResource
})

export const deleteComputeResource = computeResourceName => ({
  type: DELETE_COMPUTE_RESOURCE,
  computeResourceName
})

export const fetchComputeResourceJobStats = computeResourceName => {
  return async (dispatch, getState) => {
    const state = getState();
    let cr = findComputeResource(state, computeResourceName);
    if (!cr) return;
    if (cr.fetchingJobStats) return;
    dispatch({
      type: INIT_FETCH_COMPUTE_RESOURCE_JOB_STATS,
      computeResourceName: computeResourceName
    });
    await sleep(50);

    const url = `/api/getComputeResourceJobStats?computeResourceId=${cr.computeResourceId}&mongoUri=${encodeURIComponent(cr.mongoUri)}&databaseName=${cr.databaseName}`;
    try {
      const result = await axios.get(url);
      const jobStats = result.data;

      dispatch({
        type: RECEIVE_COMPUTE_RESOURCE_JOB_STATS,
        computeResourceName: computeResourceName,
        jobStats: jobStats
      });
    }
    catch (err) {
      console.error(err);
      dispatch({
        type: RECEIVE_COMPUTE_RESOURCE_JOB_STATS,
        computeResourceName: computeResourceName,
        jobStats: { error: true }
      });
    }
  }
}

export const fetchComputeResourceActive = computeResourceName => {
  return async (dispatch, getState) => {
    const state = getState();
    let cr = findComputeResource(state, computeResourceName);
    if (!cr) return;
    if (cr.fetchingActive) return;
    dispatch({
      type: INIT_FETCH_COMPUTE_RESOURCE_ACTIVE,
      computeResourceName: computeResourceName
    });
    await sleep(50);
    dispatch({
      type: RECEIVE_COMPUTE_RESOURCE_ACTIVE,
      computeResourceName: computeResourceName,
      active: true
    });
  }
}

const findComputeResource = (state, computeResourceName) => {
  return state.computeResources.filter(r => (r.computeResourceName === computeResourceName))[0]
}

export const setDatabaseConfig = databaseConfig => ({
  type: SET_DATABASE_CONFIG,
  databaseConfig
})

export const fetchRecordingInfo = recordingPath => {
  return async (dispatch, getState) => {
    const state = getState();
    let s = state.recordingInfoByPath || {};
    if ((s[recordingPath]) && (s[recordingPath].fetching)) {
      return;
    }
    dispatch({
      type: INIT_FETCH_RECORDING_INFO,
      recordingPath: recordingPath
    });
    await sleep(1000);

    let recordingInfo;
    try {
      recordingInfo = await runHitherJob(
        'get_recording_info',
        { recording_path: recordingPath },
        { kachery_config: { fr: 'default_readonly' } }
      ).wait();
    }
    catch (err) {
      dispatch({
        type: RECEIVE_RECORDING_INFO,
        recordingPath: recordingPath,
        error: true,
        errorMessage: err.message,
        recordingInfo: null
      });
      return;
    }
    dispatch({
      type: RECEIVE_RECORDING_INFO,
      recordingPath: recordingPath,
      error: false,
      recordingInfo: recordingInfo
    });
  }
}

const globalHitherJobStore = {};

// not an action creator
export const runHitherJob = (functionName, kwargs, opts) => {
  const jobHash = objectHash({
    functionName: functionName,
    kwargs: kwargs,
    opts: opts
  });
  const existingJob = globalHitherJobStore[jobHash];
  if (existingJob) return existingJob;
  const job = {
    jobHash: jobHash,
    functionName: functionName,
    kwargs: kwargs,
    opts: opts,
    result: null,
    runtime_info: null,
    status: 'pending'
  }
  globalHitherJobStore[job] = job;
  job.wait = async () => {
    while (true) {
      if (job.status === 'finished') {
        return job.result;
      }
      else if (job.status === 'error') {
        throw Error(job.errorMessage);
      }
      else if (job.status === 'pending') {
        job.status = 'running';
        let data;
        try {
          const url = `/api/runHitherJob`;
          const result = await axios.post(url, job);
          data = result.data;
        }
        catch (err) {
          job.status = 'error';
          job.errorMessage = 'Error calling runHitherJob';
        }
        if (!data) {
          job.status = 'error';
          job.errorMessage = 'Unexpected: No data';
        }
        if (data.error) {
          job.status = 'error';
          job.errorMessage = `Error running job: ${data.error_message}`;
          job.runtime_info = data.runtime_info;
        }
        else {
          job.status = 'finished';
          job.result = data.result;
          job.runtime_info = data.runtime_info;
        }
      }
      else {
        await sleep(50);
      }
    }
  }
  return job;
}