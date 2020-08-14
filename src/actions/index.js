export const REPORT_INITIAL_LOAD_COMPLETE = 'REPORT_INITIAL_LOAD_COMPLETE'
export const SET_WEBSOCKET_STATUS = 'SET_WEBSOCKET_STATUS'

export const SET_DATABASE_CONFIG = 'SET_DATABASE_CONFIG'

export const INIT_FETCH_RECORDING_INFO = 'INIT_FETCH_RECORDING_INFO'
export const RECEIVE_RECORDING_INFO = 'RECEIVE_RECORDING_INFO'

export const ADD_RECORDING = 'ADD_RECORDING'
export const DELETE_RECORDINGS = 'DELETE_RECORDINGS'
export const SET_RECORDING_INFO = 'SET_RECORDING_INFO'

export const ADD_SORTING = 'ADD_SORTING'
export const DELETE_SORTINGS = 'DELETE_SORTINGS'
export const DELETE_ALL_SORTINGS_FOR_RECORDINGS = 'DELETE_ALL_SORTINGS_FOR_RECORDINGS'
export const SET_SORTING_INFO = 'SET_SORTING_INFO'

export const INIT_FETCH_SORTING_INFO = 'INIT_FETCH_SORTING_INFO'
export const RECEIVE_SORTING_INFO = 'RECEIVE_SORTING_INFO'

export const SET_PERSIST_STATUS = 'SET_PERSIST_STATUS'

export const ADD_SORTING_JOB = 'ADD_SORTING_JOB'
export const START_SORTING_JOB = 'START_SORTING_JOB'
export const SET_SORTING_JOB_STATUS = 'SET_SORTING_JOB_STATUS'
export const CANCEL_SORTING_JOBS = 'CANCEL_SORTING_JOBS'
export const CANCEL_ALL_SORTING_JOBS_FOR_RECORDINGS = 'CANCEL_ALL_SORTING_JOBS_FOR_RECORDINGS'

export const SET_EXTENSION_ENABLED = 'SET_EXTENSION_ENABLED'

export const SET_DOCUMENT_INFO = 'SET_DOCUMENT_INFO'

export const SET_NODE_ID = 'SET_NODE_ID'

export const ADD_UNIT_LABEL = 'ADD_UNIT_LABEL'
export const REMOVE_UNIT_LABEL = 'REMOVE_UNIT_LABEL'

export const sleep = m => new Promise(r => setTimeout(r, m));

// no longer used
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
  recording: recording,
  persistKey: 'recordings'
})

export const deleteRecordings = recordingIds => {
  return function(dispatch) {
    dispatch({
      type: 'CANCEL_ALL_SORTING_JOBS_FOR_RECORDINGS',
      recordingIds: recordingIds,
      persistKey: 'sortings'
    });
    dispatch({
      type: 'DELETE_ALL_SORTINGS_FOR_RECORDINGS',
      recordingIds: recordingIds,
      persistKey: 'sortings'
    });
    dispatch({
      type: 'DELETE_RECORDINGS',
      recordingIds: recordingIds,
      persistKey: 'recordings'
    });
  }
}

export const setRecordingInfo = ({ recordingId, recordingInfo }) => ({
  type: SET_RECORDING_INFO,
  recordingId,
  recordingInfo
})

export const addSorting = sorting => ({
  type: ADD_SORTING,
  sorting: sorting,
  persistKey: 'sortings'
})

export const deleteSortings = sortingIds => ({
  type: DELETE_SORTINGS,
  sortingIds: sortingIds,
  persistKey: 'sortings'
})

export const setPersistStatus = status => ({
  type: SET_PERSIST_STATUS,
  status: status
})

export const addSortingJob = sortingJob => ({
  type: ADD_SORTING_JOB,
  sortingJob,
  persistKey: 'sortingJobs'
})

export const startSortingJob = (sortingJobId, recordingId, sorter) => ({
  type: START_SORTING_JOB,
  sortingJobId,
  recordingId,
  sorter,
  persistKey: 'sortingJobs'
})

export const setSortingJobStatus = (sortingJobId, status) => ({
  type: SET_SORTING_JOB_STATUS,
  sortingJobId,
  status,
  persistKey: 'sortingJobs'
})

export const cancelSortingJobs = (sortingJobIds) => ({
  type: CANCEL_SORTING_JOBS,
  sortingJobIds,
  persistKey: 'sortingJobs'
})

export const setExtensionEnabled = (extensionName, value) => ({
  type: SET_EXTENSION_ENABLED,
  extensionName,
  value
})

export const setDocumentInfo = (documentInfo) => ({
  type: SET_DOCUMENT_INFO,
  documentInfo
})

// curation

export const addUnitLabel = ({ sortingId, unitId, label }) => ({
  type: ADD_UNIT_LABEL,
  sortingId,
  unitId,
  label,
  persistKey: 'sortings'
})

export const removeUnitLabel = ({ sortingId, unitId, label }) => ({
  type: REMOVE_UNIT_LABEL,
  sortingId,
  unitId,
  label,
  persistKey: 'sortings'
})