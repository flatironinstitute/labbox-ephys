import { combineReducers } from 'redux'
import initialLoad from './initialLoad'
import databaseConfig from './databaseConfig'
import recordings from './recordings'
import sortings from './sortings'
import sortingJobs from './sortingJobs'
import jobHandlers from './jobHandlers'
import persisting from './persisting'
import hitherJobs from './hitherJobs'
import extensionsConfig from '../extensions/reducers'

export default combineReducers({
    initialLoad,
    databaseConfig,
    recordings,
    sortings,
    sortingJobs,
    jobHandlers,
    persisting,
    hitherJobs,
    extensionsConfig
})