const axios = require('axios');

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

    const url = `/getComputeResourceJobStats?computeResourceId=${cr.computeResourceId}&mongoUri=${encodeURIComponent(cr.mongoUri)}&databaseName=${cr.databaseName}`;
    console.log(url);
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

    if ((recordingPath) && (recordingPath.startsWith('sha1://'))) {
      dispatch({
        type: RECEIVE_RECORDING_INFO,
        recordingPath: recordingPath,
        error: false,
        recordingInfo: { numChannels: 12 }
      });
    }
    else {
      dispatch({
        type: RECEIVE_RECORDING_INFO,
        recordingPath: recordingPath,
        error: true,
        recordingInfo: null
      });
    }
  }
}
