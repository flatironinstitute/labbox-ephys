import { Reducer } from 'react'
import { SET_PERSIST_STATUS } from '../actions'

interface Persisting {
    status: string
}

export interface SetPersistStatusAction {
    type: 'SET_PERSIST_STATUS'
    status: string
}
const isSetPersistStatusAction = (x: any): x is SetPersistStatusAction => (
    x.type === SET_PERSIST_STATUS
)

export type State = Persisting
export type Action = SetPersistStatusAction
export const initialState: State = {status: 'initial'}

// the reducer
const persisting: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isSetPersistStatusAction(action)) {
        return {...state, status: action.status}
    }
    else {
        return state
    }
}

export default persisting