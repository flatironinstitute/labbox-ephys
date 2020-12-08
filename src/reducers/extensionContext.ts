import { Reducer } from 'react'
import { RecordingViewPlugin, SortingUnitMetricPlugin, SortingUnitViewPlugin, SortingViewPlugin } from '../extensions/extensionInterface'

export interface State {
    sortingViews: {[key: string]: SortingViewPlugin},
    sortingUnitViews: {[key: string]: SortingUnitViewPlugin},
    recordingViews: {[key: string]: RecordingViewPlugin},
    sortingUnitMetrics: {[key: string]: SortingUnitMetricPlugin}
}
export const initialState: State = {
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