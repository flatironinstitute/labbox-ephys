const axios = require('axios');
const objectHash = require('object-hash');

export const SET_DATABASE_CONFIG = 'SET_DATABASE_CONFIG'

export const INIT_FETCH_RECORDING_INFO = 'INIT_FETCH_RECORDING_INFO'
export const RECEIVE_RECORDING_INFO = 'RECEIVE_RECORDING_INFO'

export const ADD_RECORDING = 'ADD_RECORDING'
export const DELETE_RECORDINGS = 'DELETE_RECORDINGS'
export const SET_RECORDING_INFO = 'SET_RECORDING_INFO'

export const ADD_SORTING = 'ADD_SORTING'
export const DELETE_SORTINGS = 'DELETE_SORTINGS'
export const SET_SORTING_INFO = 'SET_SORTING_INFO'

export const INIT_FETCH_SORTING_INFO = 'INIT_FETCH_SORTING_INFO'
export const RECEIVE_SORTING_INFO = 'RECEIVE_SORTING_INFO'

export const SET_PERSIST_STATUS = 'SET_PERSIST_STATUS'

export const ADD_SORTING_JOB = 'ADD_SORTING_JOB'
export const SET_SORTING_JOB_STATUS = 'SET_SORTING_JOB_STATUS'
export const DELETE_SORTING_JOBS = 'DELETE_SORTING_JOBS'

export const sleep = m => new Promise(r => setTimeout(r, m));

export const setDatabaseConfig = databaseConfig => ({
  type: SET_DATABASE_CONFIG,
  databaseConfig
})

export const setSortingInfo = ({ sortingId, sortingInfo }) => ({
    type: SET_SORTING_INFO,
    sortingId,
    sortingInfo
})

const globalHitherJobStore = {};

// not an action creator
export const createHitherJob = async (functionName, kwargs, opts={}) => {
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
  globalHitherJobStore[job.jobHash] = job;
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
        let data;
        try {
          const url = `/api/hither_job_wait`;
          const result = await axios.post(url, {job_id: job.jobId});
          data = result.data;
        }
        catch (err) {
          job.status = 'error';
          job.errorMessage = 'Error calling hitherJobWait';
          break;
        }
        if (!data) {
          job.status = 'error';
          job.errorMessage = 'Unexpected: No data';
          break;
        }
        else if (data.error) {
          job.status = 'error';
          job.errorMessage = `Error running job: ${data.error_message}`;
          job.runtime_info = data.runtime_info;
          break;
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
    throw Error(job.errorMessage);
  }
  let j;
  try {
    j = await axios.post('/api/hither_job_run', job);
  }
  catch(err) {
    job.status = 'error';
    job.errorMessage = 'Error running job.';
    throw(err);
  }
  job.jobId = j.data.job_id;
  if (opts.wait) {
    return await job.wait();
  }
  return job;
}

export const addRecording = recording => ({
  type: ADD_RECORDING,
  recording: recording
})

export const deleteRecordings = recordingIds => ({
  type: DELETE_RECORDINGS,
  recordingIds: recordingIds
})

export const setRecordingInfo = ({ recordingId, recordingInfo }) => ({
  type: SET_RECORDING_INFO,
  recordingId,
  recordingInfo
})

export const addSorting = sorting => ({
  type: ADD_SORTING,
  sorting: sorting
})

export const deleteSortings = sortingIds => ({
  type: DELETE_SORTINGS,
  sortingIds: sortingIds
})

export const setPersistStatus = status => ({
  type: SET_PERSIST_STATUS,
  status: status
})

export const addSortingJob = (sortingJobId, recordingId, sorter) => ({
  type: ADD_SORTING_JOB,
  sortingJobId,
  recordingId,
  sorter
})

export const setSortingJobStatus = (sortingJobId, status) => ({
  type: SET_SORTING_JOB_STATUS,
  sortingJobId,
  status
})

export const deleteSortingJobs = (sortingJobIds) => ({
  type: DELETE_SORTING_JOBS,
  sortingJobIds
})