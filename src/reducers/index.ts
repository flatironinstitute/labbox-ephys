// import { combineReducers } from 'redux'
// import serverConnection from './serverConnection'
// import databaseConfig from './databaseConfig'
// import recordings from './recordings'
// import sortings from './sortings'
// import persisting from './persisting'
// import hitherJobs from './hitherJobs'
// import documentInfo from './documentInfo'
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
//     documentInfo
// })

import { combineReducers } from '@reduxjs/toolkit'
import extensionsConfig, { Action as ExtensionsConfigAction, State as ExtensionsConfigState } from '../extensions/reducers'
import databaseConfig, { Action as DatabaseConfigAction, State as DatabaseConfigState } from './databaseConfig'
import documentInfo, { Action as DocumentInfoAction, State as DocumentInfoState } from './documentInfo'
import extensionContext, { Action as ExtensionContextAction, State as ExtensionContextState } from './extensionContext'
import hitherContext, { Action as HitherContextAction, State as HitherContextState } from './hitherContext'
import hitherJobs, { Action as HitherJobsAction, State as HitherJobsState } from './hitherJobs'
import persisting, { Action as PersistingAction, State as PersistingState } from './persisting'
import recordings, { Action as RecordingsAction, State as RecordingsState } from './recordings'
import serverConnection, { Action as ServerConnectionAction, State as ServerConnectionState } from './serverConnection'
import serverInfo, { Action as ServerInfoAction, State as ServerInfoState } from './serverInfo'
import sortings, { Action as SortingsAction, State as SortingsState } from './sortings'

export interface RootState {
    databaseConfig: DatabaseConfigState
    documentInfo: DocumentInfoState
    hitherContext: HitherContextState
    hitherJobs: HitherJobsState
    persisting: PersistingState
    recordings: RecordingsState
    serverConnection: ServerConnectionState
    serverInfo: ServerInfoState
    sortings: SortingsState,
    extensionsConfig: ExtensionsConfigState,
    extensionContext: ExtensionContextState
}
const rootReducer = combineReducers({
    databaseConfig,
    documentInfo,
    hitherContext,
    hitherJobs,
    persisting,
    recordings,
    serverConnection,
    serverInfo,
    sortings,
    extensionsConfig,
    extensionContext
})

export type RootAction =  DatabaseConfigAction | DocumentInfoAction | HitherContextAction | HitherJobsAction | PersistingAction | RecordingsAction | ServerConnectionAction | ServerInfoAction | SortingsAction | ExtensionsConfigAction | ExtensionContextAction

export default rootReducer