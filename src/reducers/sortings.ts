import { Reducer } from 'react'
import { ADD_SORTING, ADD_UNIT_LABEL, DELETE_ALL_SORTINGS_FOR_RECORDINGS, DELETE_SORTINGS, REMOVE_UNIT_LABEL, SET_EXTERNAL_SORTING_UNIT_METRICS, SET_SORTING_INFO } from '../actions'
import { defaultSortingCuration, ExternalSortingUnitMetric, Sorting, SortingCuration, sortingCurationReducer, SortingInfo } from '../extensions/extensionInterface'
export type { ExternalSortingUnitMetric, Label, Sorting, SortingInfo } from '../extensions/extensionInterface'

type Label = string

export interface AddSortingAction {
    type: 'ADD_SORTING'
    sorting: Sorting
}
const isAddSortingAction = (x: any): x is AddSortingAction => (
    x.type === ADD_SORTING
)

export interface DeleteSortingsAction {
    type: 'DELETE_SORTINGS'
    sortingIds: string[]
}
const isDeleteSortingsAction = (x: any): x is DeleteSortingsAction => (
    x.type === DELETE_SORTINGS
)

export interface DeleteAllSortingsForRecordingsAction {
    type: 'DELETE_ALL_SORTINGS_FOR_RECORDINGS'
    recordingIds: string[]
}
const isDeleteAllSortingsForRecordingsAction = (x: any): x is DeleteAllSortingsForRecordingsAction => (
    x.type === DELETE_ALL_SORTINGS_FOR_RECORDINGS
)

export interface SetSortingInfoAction {
    type: 'SET_SORTING_INFO'
    sortingId: string
    sortingInfo: SortingInfo
}
const isSetSortingInfoAction = (x: any): x is SetSortingInfoAction => (
    x.type === SET_SORTING_INFO
)

export interface SetExternalSortingUnitMetricsAction {
    type: 'SET_EXTERNAL_SORTING_UNIT_METRICS'
    sortingId: string
    externalUnitMetrics: ExternalSortingUnitMetric[]
}
const isSetExternalSortingUnitMetricsAction = (x: any): x is SetExternalSortingUnitMetricsAction => (
    x.type === SET_EXTERNAL_SORTING_UNIT_METRICS
)

export interface AddUnitLabelAction {
    type: 'ADD_UNIT_LABEL'
    sortingId: string
    unitId: number
    label: string
}
const isAddUnitLabelAction = (x: any): x is AddUnitLabelAction => (
    x.type === ADD_UNIT_LABEL
)

export interface RemoveUnitLabelAction {
    type: 'REMOVE_UNIT_LABEL'
    sortingId: string
    unitId: number
    label: string
}
const isRemoveUnitLabelAction = (x: any): x is RemoveUnitLabelAction => (
    x.type === REMOVE_UNIT_LABEL
)

export type State = Sorting[]
export type Action = (AddSortingAction | DeleteSortingsAction | DeleteAllSortingsForRecordingsAction | SetSortingInfoAction | AddUnitLabelAction | RemoveUnitLabelAction | SetExternalSortingUnitMetricsAction) & {persistKey?: string}
export const initialState: State = []

// the reducer
const sortings: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isAddSortingAction(action)) {
        return [
            ...state,
            action.sorting
        ]
    }
    else if (isDeleteSortingsAction(action)) {
        const exclude = Object.fromEntries(action.sortingIds.map(id => [id, true]));
        return state.filter(s => (
            !(s.sortingId in exclude)
        ));
    }
    else if (isDeleteAllSortingsForRecordingsAction(action)) {
        const excludeRecordingIds = Object.fromEntries(action.recordingIds.map(id => [id, true]));
        return state.filter(s => (
            !(s.recordingId in excludeRecordingIds)
        ));
    }
    else if (isSetSortingInfoAction(action)) {
        return state.map(s => (
            s.sortingId === action.sortingId ? (
                {
                    ...s,
                    sortingInfo: action.sortingInfo
                }
            ): s
        ))
    }
    else if ((isAddUnitLabelAction(action)) || (isRemoveUnitLabelAction(action))) {
        return state.map(s => (
            s.sortingId === action.sortingId ? (
                {
                    ...s,
                    curation: unitCurationReducer(s.curation || defaultSortingCuration, action)
                }
            ): s
        ))
    }
    else if (isSetExternalSortingUnitMetricsAction(action)) {
        return state.map(s => (
            s.sortingId === action.sortingId ? (
                {
                    ...s,
                    externalUnitMetrics: action.externalUnitMetrics
                }
            ): s
        ))
    }
    else {
        return state
    }
}

type Curation = {[key: string]: {labels: string[]}}


const unitCurationReducer = (curation: SortingCuration, action: Action): SortingCuration => {
    // returns object corresponding to the value of the 'unitCuration' key of a sorting.
    if (action.type !== ADD_UNIT_LABEL && action.type !== REMOVE_UNIT_LABEL) {
        return curation
    }
    if (action.type === 'ADD_UNIT_LABEL') {
        return sortingCurationReducer(curation, {type: 'AddLabel', unitId: action.unitId, label: action.label})
    }
    else if (action.type === 'REMOVE_UNIT_LABEL') {
        return sortingCurationReducer(curation, {type: 'RemoveLabel', unitId: action.unitId, label: action.label})
    }
    else {
        return curation
    }
}

export default sortings