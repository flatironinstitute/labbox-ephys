import { Reducer } from 'react'
import { SortingUnitViewPlugin, SortingViewPlugin } from '../extension'

export interface State {
    sortingViews: SortingViewPlugin[],
    sortingUnitViews: SortingUnitViewPlugin[]
}
const initialState: State = {
    sortingViews: [],
    sortingUnitViews: []
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

export type Action = RegisterSortingViewAction | RegisterSortingUnitViewAction

const sortByPriority = <T extends {priority?: number}>(x: T[]) => {
    return x.sort((a, b) => ((b.priority || 0) - (a.priority || 0)))
}

// the reducer
const extensionContext: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isRegisterSortingViewAction(action)) {
        return {
            ...state,
            sortingViews: sortByPriority([
                ...state.sortingViews,
                action.sortingView
            ])
        }
    }
    else if (isRegisterSortingUnitViewAction(action)) {
        return {
            ...state,
            sortingUnitViews: sortByPriority([
                ...state.sortingUnitViews,
                action.sortingUnitView
            ])
        }
    }
    else {
        return state
    }
}

export default extensionContext