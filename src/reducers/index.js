import { combineReducers } from 'redux'
import serverConnection from './serverConnection'
import databaseConfig from './databaseConfig'
import recordings from './recordings'
import sortings from './sortings'
import sortingJobs from './sortingJobs'
import jobHandlers from './jobHandlers'
import persisting from './persisting'
import hitherJobs from './hitherJobs'
import documentInfo from './documentInfo'
import serverInfo from './serverInfo'
import extensionsConfig from '../extensions/reducers'

export default combineReducers({
    databaseConfig,
    recordings,
    serverInfo,
    sortings,
    sortingJobs,
    jobHandlers,
    persisting,
    serverConnection,
    hitherJobs,
    extensionsConfig,
    documentInfo
})