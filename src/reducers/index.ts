// import { combineReducers } from 'redux'
// import serverConnection from './serverConnection'
// import databaseConfig from './databaseConfig'
// import recordings from './recordings'
// import sortings from './sortings'
// import persisting from './persisting'
// import hitherJobs from './hitherJobs'
// import workspaceInfo from './workspaceInfo'
// import serverInfo from './serverInfo'
// import extensionsConfig from '../extensions/reducers'

// export default combineReducers({
//     databaseConfig,
//     recordings,
//     serverInfo,
//     sortings,
//     persisting,
//     serverConnection,
//     hitherJobs,
//     extensionsConfig,
//     workspaceInfo
// })

import { combineReducers } from '@reduxjs/toolkit'
import extensionsConfig, { Action as ExtensionsConfigAction, State as ExtensionsConfigState } from '../extensions/reducers'
import databaseConfig, { Action as DatabaseConfigAction, State as DatabaseConfigState } from './databaseConfig'
import hitherJobs, { Action as HitherJobsAction, State as HitherJobsState } from './hitherJobs'
import persisting, { Action as PersistingAction, State as PersistingState } from './persisting'
import serverConnection, { Action as ServerConnectionAction, State as ServerConnectionState } from './serverConnection'
import serverInfo, { Action as ServerInfoAction, State as ServerInfoState } from './serverInfo'

export interface RootState {
    databaseConfig: DatabaseConfigState
    hitherJobs: HitherJobsState
    persisting: PersistingState
    serverConnection: ServerConnectionState
    serverInfo: ServerInfoState
    extensionsConfig: ExtensionsConfigState
}
const rootReducer = combineReducers({
    databaseConfig,
    hitherJobs,
    persisting,
    serverConnection,
    serverInfo,
    extensionsConfig
})

export type RootAction =  DatabaseConfigAction | HitherJobsAction | PersistingAction | ServerConnectionAction | ServerInfoAction | ExtensionsConfigAction

export default rootReducer