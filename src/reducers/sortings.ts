import { Reducer } from 'react'
import { ADD_SORTING, ADD_UNIT_LABEL, DELETE_ALL_SORTINGS_FOR_RECORDINGS, DELETE_SORTINGS, REMOVE_UNIT_LABEL, SET_EXTERNAL_SORTING_UNIT_METRICS, SET_SORTING_INFO } from '../actions'

export interface SortingInfo {
    unit_ids: number[]
}

type Label = string

export type ExternalSortingUnitMetric = {name: string, label: string, tooltip?: string, data: {[key: string]: number}}

export interface Sorting {
    sortingId: string
    sortingLabel: string
    sortingPath: string
    sortingObject: any
    recordingId: string
    recordingPath: string
    recordingObject: any
    externalUnitMetricsUri?: string

    // the following are not imported
    sortingInfo?: SortingInfo
    externalUnitMetrics?: ExternalSortingUnitMetric[]
    unitCuration?: {[key: string]: {labels: Label[]}}
}

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
export type Action = AddSortingAction | DeleteSortingsAction | DeleteAllSortingsForRecordingsAction | SetSortingInfoAction | AddUnitLabelAction | RemoveUnitLabelAction | SetExternalSortingUnitMetricsAction
const initialState: State = []

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
                    unitCuration: unitCurationReducer(s.unitCuration, action)
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

const setAdd = (thelist: string[] = [], item: string) => {
    return thelist.filter(l => (l !== item)).concat(item).sort()
}

const setRemove = (thelist: string[] = [], item: string) => {
    return thelist.filter(l => (l !== item)).sort()
}

type Curation = {[key: string]: {labels: string[]}}


const unitCurationReducer = (curation: Curation = { }, action: Action) => {
    // returns object corresponding to the value of the 'unitCuration' key of a sorting.
    if (action.type !== ADD_UNIT_LABEL && action.type !== REMOVE_UNIT_LABEL) {
        return { ...curation }
    }
    return {
        ...curation,
        [action.unitId]: {
            ...(curation[action.unitId + ''] || {labels: []}),
            labels: unitLabelReducer((curation[action.unitId + ''] || {labels: []}).labels, action)
        }
    }
}

const unitLabelReducer = (labels: string[] = [], action: Action) => {
    if (action.type === ADD_UNIT_LABEL) {
        return setAdd(labels, action.label)
    }
    if (action.type === REMOVE_UNIT_LABEL) {
        return setRemove(labels, action.label)
    }
}

export default sortings