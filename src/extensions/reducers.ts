import { Reducer } from 'react'
import { SET_EXTENSION_ENABLED } from '../actions'

interface ExtensionsState {
    enabled: {
        [key: string]: boolean
    }
    extensions: {
        [key: string]: any
    }
}

export interface SetExtensionEnabledAction {
    type: 'SET_EXTENSION_ENABLED'
    extensionName: string
    value: boolean
}
const isSetExtensionEnabledAction = (x: any): x is SetExtensionEnabledAction => (
    x.type === SET_EXTENSION_ENABLED
)

export type State = ExtensionsState
export type Action = SetExtensionEnabledAction
const initialState: State = {enabled: {}, extensions: {}}

// the reducer
const extensionsConfig: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isSetExtensionEnabledAction(action)) {
        return {
            ...state,
            enabled: {
                ...state.enabled,
                [action.extensionName]: action.value
            }
        }
    }
    else {
        return state
    }
}

export default extensionsConfig