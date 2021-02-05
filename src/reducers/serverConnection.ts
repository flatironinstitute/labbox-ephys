import { Reducer } from 'react'
import { REPORT_INITIAL_LOAD_COMPLETE, SET_WEBSOCKET_STATUS } from '../actions'

export interface ServerConnectionState {
    initialLoadComplete: boolean
    websocketStatus: 'pending' | 'connected' | 'disconnected'
}

interface ReportInitialLoadCompleteAction {
    type: 'REPORT_INITIAL_LOAD_COMPLETE'
}
const isReportInitialLoadCompleteAction = (x: any): x is ReportInitialLoadCompleteAction => (
    x.type === REPORT_INITIAL_LOAD_COMPLETE
)

interface SetWebsocketStatusAction {
    type: 'SET_WEBSOCKET_STATUS'
    websocketStatus: 'pending' | 'connected' | 'disconnected'
}
const isSetWebsocketStatusAction = (x: any): x is SetWebsocketStatusAction => (
    x.type === SET_WEBSOCKET_STATUS
)

export type State = ServerConnectionState
export type Action = SetWebsocketStatusAction | ReportInitialLoadCompleteAction
export const initialState: State = {
    initialLoadComplete: false,
    websocketStatus: 'pending'
}

// the reducer
const serverConnection: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isReportInitialLoadCompleteAction(action)) {
        return {...state, initialLoadComplete: true}
    }
    else if (isSetWebsocketStatusAction(action)) {
        return {...state, websocketStatus: action.websocketStatus}
    }
    else {
        return state
    }
}

export default serverConnection