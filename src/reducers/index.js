import { combineReducers } from 'redux'
import computeResources from './computeResources'
import databaseConfig from './databaseConfig'
import recordingInfoByPath from './recordingInfoByPath'

export default combineReducers({
    computeResources,
    databaseConfig,
    recordingInfoByPath
})