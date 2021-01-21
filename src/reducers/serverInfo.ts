import { Reducer } from 'react'
import { SET_SERVER_INFO } from '../actions'

type HandlerType = 'local' | 'remote'

export interface ServerInfo {
    nodeId?: string
    defaultFeedId?: string
    labboxConfig?: {
        compute_resource_uri: string
            job_handlers: {
            local: {
                type: HandlerType
            },
            partition1: {
                type: HandlerType
            },
            partition2: {
                type: HandlerType
            },
            partition3: {
                type: HandlerType
            },
            timeseries: {
                type: HandlerType
            }
        }
    }
}

interface SetServerInfoAction {
    type: 'SET_SERVER_INFO'
    serverInfo: ServerInfo
}
const isSetServerInfoAction = (x: any): x is SetServerInfoAction => (
    x.type === SET_SERVER_INFO
)

export type State = ServerInfo
export type Action = SetServerInfoAction
export const initialState: State = {}

// the reducer
const serverInfo: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isSetServerInfoAction(action)) {
        return action.serverInfo
    }
    else {
        return state
    }
}

export default serverInfo