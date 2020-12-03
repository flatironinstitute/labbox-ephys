import { Reducer } from 'react'
import { RecordingViewPlugin, SortingUnitMetricPlugin, SortingUnitViewPlugin, SortingViewPlugin } from '../extension'

export interface State {
    sortingViews: {[key: string]: SortingViewPlugin},
    sortingUnitViews: {[key: string]: SortingUnitViewPlugin},
    recordingViews: {[key: string]: RecordingViewPlugin},
    sortingUnitMetrics: {[key: string]: SortingUnitMetricPlugin}
}
const initialState: State = {
    sortingViews: {},
    sortingUnitViews: {},
    recordingViews: {},
    sortingUnitMetrics: {}
}

export interface RegisterSortingViewAction {
    type: 'REGISTER_SORTING_VIEW'
    sortingView: SortingViewPlugin
}
const isRegisterSortingViewAction = (x: any): x is RegisterSortingViewAction => (
    x.type === 'REGISTER_SORTING_VIEW'
)

export interface RegisterSortingUnitViewAction {
    type: 'REGISTER_SORTING_UNIT_VIEW'
    sortingUnitView: SortingUnitViewPlugin
}
const isRegisterSortingUnitViewAction = (x: any): x is RegisterSortingUnitViewAction => (
    x.type === 'REGISTER_SORTING_UNIT_VIEW'
)

export interface RegisterRecordingViewAction {
    type: 'REGISTER_RECORDING_VIEW'
    recordingView: RecordingViewPlugin
}
const isRegisterRecordingViewAction = (x: any): x is RegisterRecordingViewAction => (
    x.type === 'REGISTER_RECORDING_VIEW'
)

export interface RegisterSortingUnitMetricAction {
    type: 'REGISTER_SORTING_UNIT_METRIC'
    sortingUnitMetric: SortingUnitMetricPlugin
}
const isRegisterSortingUnitMetricAction = (x: any): x is RegisterSortingUnitMetricAction => (
    x.type === 'REGISTER_SORTING_UNIT_METRIC'
)

export type Action = RegisterSortingViewAction | RegisterSortingUnitViewAction | RegisterRecordingViewAction | RegisterSortingUnitMetricAction

const isArray = <T>(x: any): x is T[] => {
    return (Array.isArray(x))
}

export const sortByPriority = <T extends {priority?: number}>(x: T[] | {[key: string]: T}): T[] => {
    if (isArray<T>(x)) {
        return x.sort((a, b) => ((b.priority || 0) - (a.priority || 0)))
    }
    else {
        return sortByPriority(Object.values(x))
    }
}

// the reducer
const extensionContext: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isRegisterSortingViewAction(action)) {
        return {
            ...state,
            sortingViews: {
                ...state.sortingViews,
                [action.sortingView.name]: action.sortingView
            }
        }
    }
    else if (isRegisterSortingUnitViewAction(action)) {
        return {
            ...state,
            sortingUnitViews: {
                ...state.sortingUnitViews,
                [action.sortingUnitView.name]: action.sortingUnitView
            }
        }
    }
    else if (isRegisterRecordingViewAction(action)) {
        return {
            ...state,
            recordingViews: {
                ...state.recordingViews,
                [action.recordingView.name]: action.recordingView
            }
        }
    }
    else if (isRegisterSortingUnitMetricAction(action)) {
        return {
            ...state,
            sortingUnitMetrics: {
                ...state.sortingUnitMetrics,
                [action.sortingUnitMetric.name]: action.sortingUnitMetric
            }
        }
    }
    else {
        return state
    }
}

export default extensionContext