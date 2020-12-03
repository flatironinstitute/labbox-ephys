import { Dispatch } from 'react'
import { SetExtensionEnabledAction } from '../extensions/reducers'
import { RootAction } from '../reducers'
import { DatabaseConfig, SetDatabaseConfigAction } from '../reducers/databaseConfig'
import { DocumentInfo, SetDocumentInfoAction } from '../reducers/documentInfo'
import { SetPersistStatusAction } from '../reducers/persisting'
import { AddRecordingAction, Recording, RecordingInfo, SetRecordingInfoAction } from '../reducers/recordings'
import { AddSortingAction, AddUnitLabelAction, DeleteSortingsAction, ExternalSortingUnitMetric, RemoveUnitLabelAction, SetExternalSortingUnitMetricsAction, SetSortingInfoAction, Sorting, SortingInfo } from '../reducers/sortings'

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

export const ADD_UNIT_LABEL = 'ADD_UNIT_LABEL'
export const REMOVE_UNIT_LABEL = 'REMOVE_UNIT_LABEL'

export const sleep = (m: number) => new Promise(r => setTimeout(r, m));

// no longer used
export const setDatabaseConfig = (databaseConfig: DatabaseConfig): SetDatabaseConfigAction => ({
  type: SET_DATABASE_CONFIG,
  databaseConfig
})

export const setSortingInfo = (a: { sortingId: string, sortingInfo: SortingInfo }): SetSortingInfoAction => ({
    type: SET_SORTING_INFO,
    sortingId: a.sortingId,
    sortingInfo: a.sortingInfo
})

export const setExternalSortingUnitMetrics = (a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }): SetExternalSortingUnitMetricsAction => ({
  type: SET_EXTERNAL_SORTING_UNIT_METRICS,
  sortingId: a.sortingId,
  externalUnitMetrics: a.externalUnitMetrics
})

interface PersistAction {
  persistKey?: string
}

export const addRecording = (recording: Recording): AddRecordingAction & PersistAction => ({
  type: ADD_RECORDING,
  recording: recording,
  persistKey: 'recordings'
})

export const deleteRecordings = (recordingIds: string[]) => {
  return function(dispatch: Dispatch<RootAction & PersistAction>) {
    dispatch({
      type: DELETE_ALL_SORTINGS_FOR_RECORDINGS,
      recordingIds: recordingIds,
      persistKey: 'sortings'
    });
    dispatch({
      type: DELETE_RECORDINGS,
      recordingIds: recordingIds,
      persistKey: 'recordings'
    });
  }
}

export const setRecordingInfo = (a: { recordingId: string, recordingInfo: RecordingInfo }): SetRecordingInfoAction => ({
  type: SET_RECORDING_INFO,
  recordingId: a.recordingId,
  recordingInfo: a.recordingInfo
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

export const setDocumentInfo = (documentInfo: DocumentInfo): SetDocumentInfoAction => ({
  type: SET_DOCUMENT_INFO,
  documentInfo
})

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