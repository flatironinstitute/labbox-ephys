import { combineReducers } from 'redux'
import databaseConfig from './databaseConfig'
import recordings from './recordings'
import sortings from './sortings'
import sortingJobs from './sortingJobs'
import jobHandlers from './jobHandlers'
import persisting from './persisting'

export default combineReducers({
    databaseConfig,
    recordings,
    sortings,
    sortingJobs,
    jobHandlers,
    persisting
})