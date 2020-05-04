import { combineReducers } from 'redux'
import computeResources from './computeResources'
import databaseConfig from './databaseConfig'
import recordingInfoByPath from './recordingInfoByPath'
import sortingInfoByPath from './sortingInfoByPath'
import recordings from './recordings'
import sortings from './sortings'
import persisting from './persisting'

export default combineReducers({
    computeResources,
    databaseConfig,
    recordingInfoByPath,
    sortingInfoByPath,
    recordings,
    sortings,
    persisting
})