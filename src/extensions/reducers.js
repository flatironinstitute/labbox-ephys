import { combineReducers } from 'redux';
import { SET_EXTENSION_ENABLED } from '../actions'

import frankLabDataJoint from './frankLabDataJoint/reducers'

const initialState = {
    frankLabDataJoint: false,
    development: false
}

const enabled = (state = initialState, action) => {
    switch (action.type) {
        case SET_EXTENSION_ENABLED:
            return {
                ...state,
                [action.extensionName]: action.value
            }
        default:
            return state
    }
}

export default combineReducers({
    enabled,
    frankLabDataJoint
})
