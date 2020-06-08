import { combineReducers } from 'redux';
import { SET_EXTENSION_ENABLED } from '../actions'

import frankLabDataJoint from './frankLabDataJoint/reducers'

const enabled = (state = {}, action) => {
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
