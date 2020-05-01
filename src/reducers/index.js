import { combineReducers } from 'redux'
import computeResources from './computeResources'
import databaseConfig from './databaseConfig'
import recordingInfoByPath from './recordingInfoByPath'
import sortingInfoByPath from './sortingInfoByPath'
import recordings from './recordings'
import sortings from './sortings'

export default combineReducers({
    computeResources,
    databaseConfig,
    recordingInfoByPath,
    sortingInfoByPath,
    recordings,
    sortings
})