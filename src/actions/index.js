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