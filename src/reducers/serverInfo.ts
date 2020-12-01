import { Reducer } from 'react'
import { SET_SERVER_INFO } from '../actions'

interface ServerInfo {
    nodeId: string | null
    defaultFeedId: string | null
}

interface SetServerInfoAction {
    type: 'SET_SERVER_INFO'
    nodeId: string
    defaultFeedId: string
}
const isSetServerInfoAction = (x: any): x is SetServerInfoAction => (
    x.type === SET_SERVER_INFO
)

export type State = ServerInfo
export type Action = SetServerInfoAction
const initialState: State = {nodeId: null, defaultFeedId: null}

// the reducer
const serverInfo: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isSetServerInfoAction(action)) {
        return {
            nodeId: action.nodeId,
            defaultFeedId: action.defaultFeedId
        }
    }
    else {
        return state
    }
}

export default serverInfo