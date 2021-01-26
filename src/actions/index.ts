import { SetExtensionEnabledAction } from '../extensions/reducers'
import { DatabaseConfig, SetDatabaseConfigAction } from '../reducers/databaseConfig'
import { SetPersistStatusAction } from '../reducers/persisting'
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< 13373a8a30be1f9ea678e7f96755fb69949fe6b4
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
import { AddRecordingAction, DeleteRecordingsAction, Recording } from '../reducers/recordings'
import { AddSortingAction, AddUnitLabelAction, DeleteSortingsAction, DeleteSortingsForRecordingsAction, ExternalSortingUnitMetric, RemoveUnitLabelAction, SetExternalSortingUnitMetricsAction, Sorting } from '../reducers/sortings'
=======
import { AddRecordingAction, Recording, RecordingInfo, SetRecordingInfoAction } from '../reducers/recordings'
=======
import { AddRecordingAction, DeleteRecordingsAction, Recording, RecordingInfo, SetRecordingInfoAction } from '../reducers/recordings'
>>>>>>> add WorspaceView
import { AddSortingAction, AddUnitLabelAction, DeleteSortingsAction, ExternalSortingUnitMetric, RemoveUnitLabelAction, SetExternalSortingUnitMetricsAction, SetSortingInfoAction, Sorting, SortingInfo } from '../reducers/sortings'
import { SetWorkspaceInfoAction, WorkspaceInfo } from '../reducers/workspaceInfo'
>>>>>>> import recordings view python scripts
=======
import { AddRecordingAction, DeleteRecordingsAction, Recording } from '../reducers/recordings'
import { AddSortingAction, AddUnitLabelAction, DeleteSortingsAction, DeleteSortingsForRecordingsAction, ExternalSortingUnitMetric, RemoveUnitLabelAction, SetExternalSortingUnitMetricsAction, Sorting } from '../reducers/sortings'
>>>>>>> workspace view and simplified state flow

export const REPORT_INITIAL_LOAD_COMPLETE = 'REPORT_INITIAL_LOAD_COMPLETE'
export const SET_WEBSOCKET_STATUS = 'SET_WEBSOCKET_STATUS'

export const SET_DATABASE_CONFIG = 'SET_DATABASE_CONFIG'

export const INIT_FETCH_RECORDING_INFO = 'INIT_FETCH_RECORDING_INFO'
export const RECEIVE_RECORDING_INFO = 'RECEIVE_RECORDING_INFO'

export const ADD_RECORDING = 'ADD_RECORDING'
export const DELETE_RECORDINGS = 'DELETE_RECORDINGS'
export const DELETE_SORTINGS_FOR_RECORDINGS = 'DELETE_SORTINGS_FOR_RECORDINGS'

export const ADD_SORTING = 'ADD_SORTING'
export const DELETE_SORTINGS = 'DELETE_SORTINGS'
export const SET_SORTING_INFO = 'SET_SORTING_INFO'
export const SET_EXTERNAL_SORTING_UNIT_METRICS = 'SET_EXTERNAL_SORTING_UNIT_METRICS'

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

export const SET_SERVER_INFO = 'SET_SERVER_INFO'

export const SET_CURATION = 'SET_CURATION'
export const ADD_UNIT_LABEL = 'ADD_UNIT_LABEL'
export const REMOVE_UNIT_LABEL = 'REMOVE_UNIT_LABEL'
export const MERGE_UNITS = 'MERGE_UNITS'
export const UNMERGE_UNITS = 'UNMERGE_UNITS'

export const sleep = (m: number) => new Promise(r => setTimeout(r, m));

// no longer used
export const setDatabaseConfig = (databaseConfig: DatabaseConfig): SetDatabaseConfigAction => ({
  type: SET_DATABASE_CONFIG,
  databaseConfig
})

export const setExternalSortingUnitMetrics = (a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }): SetExternalSortingUnitMetricsAction => ({
  type: SET_EXTERNAL_SORTING_UNIT_METRICS,
  sortingId: a.sortingId,
  externalUnitMetrics: a.externalUnitMetrics
})

interface PersistAction {
  persistKey?: string | string[]
}

export const addRecording = (recording: Recording): AddRecordingAction & PersistAction => ({
  type: ADD_RECORDING,
  recording: recording,
  persistKey: 'recordings'
})

<<<<<<< 13373a8a30be1f9ea678e7f96755fb69949fe6b4
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
export const deleteRecordings = (recordingIds: string[]): DeleteRecordingsAction & PersistAction => ({
=======
export const deleteRecordings = (dispatch: Dispatch<RootAction & PersistAction>, recordingIds: string[]) => {
  dispatch({
>>>>>>> import recordings view python scripts
=======
export const deleteRecordings = (recordingIds: string[]): DeleteRecordingsAction & PersistAction => ({
>>>>>>> add WorspaceView
    type: DELETE_RECORDINGS,
    recordingIds: recordingIds,
    persistKey: 'recordings'
})

export const deleteSortingsForRecordings = (recordingIds: string[]): DeleteSortingsForRecordingsAction & PersistAction => ({
  type: DELETE_SORTINGS_FOR_RECORDINGS,
  recordingIds: recordingIds,
  persistKey: 'sortings'
})

export const addSorting = (sorting: Sorting): AddSortingAction & PersistAction => ({
  type: ADD_SORTING,
  sorting: sorting,
  persistKey: 'sortings'
})

export const deleteSortings = (sortingIds: string[]): DeleteSortingsAction & PersistAction => ({
  type: DELETE_SORTINGS,
  sortingIds: sortingIds,
  persistKey: 'sortings'
})

export const setPersistStatus = (status: string): SetPersistStatusAction => ({
  type: SET_PERSIST_STATUS,
  status: status
})

export const setExtensionEnabled = (extensionName: string, value: boolean): SetExtensionEnabledAction => ({
  type: SET_EXTENSION_ENABLED,
  extensionName,
  value
})

<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
export const setWorkspaceInfo = (workspaceInfo: WorkspaceInfo): SetWorkspaceInfoAction => ({
  type: SET_DOCUMENT_INFO,
  workspaceInfo
})

>>>>>>> import recordings view python scripts
=======
>>>>>>> workspace view and simplified state flow
// curation

export const addUnitLabel = (a: { sortingId: string, unitId: number, label: string }): AddUnitLabelAction & PersistAction => ({
  type: ADD_UNIT_LABEL,
  sortingId: a.sortingId,
  unitId: a.unitId,
  label: a.label,
  persistKey: 'sortings'
})

export const removeUnitLabel = (a: { sortingId: string, unitId: number, label: string }): RemoveUnitLabelAction & PersistAction => ({
  type: REMOVE_UNIT_LABEL,
  sortingId: a.sortingId,
  unitId: a.unitId,
  label: a.label,
  persistKey: 'sortings'
})