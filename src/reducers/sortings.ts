import { Reducer } from 'react'
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
import { ADD_SORTING, ADD_UNIT_LABEL, DELETE_SORTINGS, DELETE_SORTINGS_FOR_RECORDINGS, MERGE_UNITS, REMOVE_UNIT_LABEL, SET_CURATION, SET_EXTERNAL_SORTING_UNIT_METRICS, UNMERGE_UNITS } from '../actions'
import { ExternalSortingUnitMetric, Sorting, SortingCuration, sortingCurationReducer } from '../extensions/extensionInterface'
=======
import { ADD_SORTING, ADD_UNIT_LABEL, DELETE_SORTINGS, MERGE_UNITS, REMOVE_UNIT_LABEL, SET_CURATION, SET_EXTERNAL_SORTING_UNIT_METRICS, SET_SORTING_INFO, UNMERGE_UNITS } from '../actions'
import { ExternalSortingUnitMetric, Sorting, SortingCuration, sortingCurationReducer, SortingInfo } from '../extensions/extensionInterface'
>>>>>>> import recordings view python scripts
import { DeleteRecordingsAction, isDeleteRecordingsAction } from './recordings'
export type { ExternalSortingUnitMetric, Label, Sorting, SortingInfo } from '../extensions/extensionInterface'

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

<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
export interface DeleteSortingsForRecordingsAction {
    type: 'DELETE_SORTINGS_FOR_RECORDINGS'
    recordingIds: string[]
}
export const isDeleteSortingsForRecordingsAction = (x: any): x is DeleteSortingsForRecordingsAction => (
    x.type === DELETE_SORTINGS_FOR_RECORDINGS
=======
export interface SetSortingInfoAction {
    type: 'SET_SORTING_INFO'
    sortingId: string
    sortingInfo: SortingInfo
}
const isSetSortingInfoAction = (x: any): x is SetSortingInfoAction => (
    x.type === SET_SORTING_INFO
>>>>>>> import recordings view python scripts
)

export interface SetExternalSortingUnitMetricsAction {
    type: 'SET_EXTERNAL_SORTING_UNIT_METRICS'
    sortingId: string
    externalUnitMetrics: ExternalSortingUnitMetric[]
}
const isSetExternalSortingUnitMetricsAction = (x: any): x is SetExternalSortingUnitMetricsAction => (
    x.type === SET_EXTERNAL_SORTING_UNIT_METRICS
)

export interface SetCurationAction {
    type: 'SET_CURATION'
    sortingId: string
    curation: SortingCuration
}
const isSetCurationAction = (x: any): x is SetCurationAction => (
    x.type === SET_CURATION
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

export interface MergeUnitsAction {
    type: 'MERGE_UNITS'
    sortingId: string
    unitIds: number[]
}
const isMergeUnitsAction = (x: any): x is MergeUnitsAction => (
    x.type === MERGE_UNITS
)

export interface UnmergeUnitsAction {
    type: 'UNMERGE_UNITS'
    sortingId: string
    unitIds: number[]
}
const isUnmergeUnitsAction = (x: any): x is UnmergeUnitsAction => (
    x.type === UNMERGE_UNITS
)

export type State = Sorting[]
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
export type Action = (AddSortingAction | DeleteSortingsAction | DeleteSortingsForRecordingsAction | DeleteRecordingsAction | SetCurationAction | AddUnitLabelAction | RemoveUnitLabelAction | MergeUnitsAction | UnmergeUnitsAction | SetExternalSortingUnitMetricsAction) & {persistKey?: string}
=======
export type Action = (AddSortingAction | DeleteSortingsAction | DeleteRecordingsAction | SetSortingInfoAction | SetCurationAction | AddUnitLabelAction | RemoveUnitLabelAction | MergeUnitsAction | UnmergeUnitsAction | SetExternalSortingUnitMetricsAction) & {persistKey?: string}
>>>>>>> import recordings view python scripts
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
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
    else if (isDeleteSortingsForRecordingsAction(action)) {
        const exclude = Object.fromEntries(action.recordingIds.map(id => [id, true]));
        return state.filter(s => (
            !(s.recordingId in exclude)
        ));
    }
=======
>>>>>>> import recordings view python scripts
    else if (isDeleteRecordingsAction(action)) {
        const excludeRecordingIds = Object.fromEntries(action.recordingIds.map(id => [id, true]));
        return state.filter(s => (
            !(s.recordingId in excludeRecordingIds)
        ));
    }
    else if ((isSetCurationAction(action)) || (isAddUnitLabelAction(action)) || (isRemoveUnitLabelAction(action)) || (isMergeUnitsAction(action)) || (isUnmergeUnitsAction(action))) {
        return state.map(s => (
            s.sortingId === action.sortingId ? (
                {
                    ...s,
                    curation: unitCurationReducer(s.curation || {}, action)
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

const unitCurationReducer = (curation: SortingCuration, action: Action): SortingCuration => {
    // returns object corresponding to the value of the 'unitCuration' key of a sorting.
    if (action.type === 'SET_CURATION') {
        return action.curation
    }
    else if (action.type === 'MERGE_UNITS') {
        return sortingCurationReducer(curation, {type: 'MergeUnits', unitIds: action.unitIds})
    }
    else if (action.type === 'UNMERGE_UNITS') {
        return sortingCurationReducer(curation, {type: 'UnmergeUnits', unitIds: action.unitIds})
    }
    else if (action.type === 'ADD_UNIT_LABEL') {
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