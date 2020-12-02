import { Reducer } from 'react'
import { SortingViewPlugin } from '../extension'

export interface State {
    sortingViews: SortingViewPlugin[],
}
const initialState: State = {
    sortingViews: []
}

export interface RegisterSortingViewAction {
    type: 'REGISTER_SORTING_VIEW'
    sortingView: SortingViewPlugin
}
const isRegisterSortingViewAction = (x: any): x is RegisterSortingViewAction => (
    x.type === 'REGISTER_SORTING_VIEW'
)

export type Action = RegisterSortingViewAction

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
    else {
        return state
    }
}

export default extensionContext