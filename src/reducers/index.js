import { combineReducers } from 'redux'
import computeResources from './computeResources'
import databaseConfig from './databaseConfig'
import recordingInfoByPath from './recordingInfoByPath'
import sortingInfoByPath from './sortingInfoByPath'
import recordings from './recordings'
import sortings from './sortings'

import { SET_PERSIST_STATUS } from '../actions'

const persisting = (state = {status: 'initial'}, action) => {
    switch (action.type) {
        case SET_PERSIST_STATUS:
            return {
                ...state,
                status: action.status
            };
        default:
            return state
    }
}

export default combineReducers({
    computeResources,
    databaseConfig,
    recordingInfoByPath,
    sortingInfoByPath,
    recordings,
    sortings,
    persisting
})