import { Reducer } from 'react'
import { SET_DOCUMENT_INFO } from '../actions'

export interface DocumentInfo {
    documentId: string | null
    feedUri: string | null
    readOnly: boolean | null
}

export interface SetDocumentInfoAction {
    type: 'SET_DOCUMENT_INFO'
    documentInfo: DocumentInfo
}
const isSetDocumentInfoAction = (x: any): x is SetDocumentInfoAction => (
    x.type === SET_DOCUMENT_INFO
)

export type State = DocumentInfo
export type Action = SetDocumentInfoAction
export const initialState: State = {documentId: null, feedUri: null, readOnly: null}

// the reducer
const documentInfo: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isSetDocumentInfoAction(action)) {
        return action.documentInfo
    }
    else {
        return state
    }
}

export default documentInfo