import { Reducer } from 'react'
import { SET_DOCUMENT_INFO } from '../actions'

export interface WorkspaceInfo {
    workspaceName: string | null
    feedUri: string | null
    readOnly: boolean | null
}

export interface SetWorkspaceInfoAction {
    type: 'SET_DOCUMENT_INFO'
    workspaceInfo: WorkspaceInfo
}
const isSetWorkspaceInfoAction = (x: any): x is SetWorkspaceInfoAction => (
    x.type === SET_DOCUMENT_INFO
)

export type State = WorkspaceInfo
export type Action = SetWorkspaceInfoAction
export const initialState: State = {workspaceName: null, feedUri: null, readOnly: null}

// the reducer
const workspaceInfo: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isSetWorkspaceInfoAction(action)) {
        return action.workspaceInfo
    }
    else {
        return state
    }
}

export default workspaceInfo