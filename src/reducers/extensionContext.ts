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

// the reducer
const extensionContext: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isRegisterSortingViewAction(action)) {
        return {
            ...state,
            sortingViews: [
                ...state.sortingViews,
                action.sortingView
            ]
        }
    }
    else {
        return state
    }
}

export default extensionContext