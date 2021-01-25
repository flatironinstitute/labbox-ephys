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
import plugins, { Action as PluginsAction, State as PluginsState } from './plugins'
import recordings, { Action as RecordingsAction, State as RecordingsState } from './recordings'
import serverConnection, { Action as ServerConnectionAction, State as ServerConnectionState } from './serverConnection'
import serverInfo, { Action as ServerInfoAction, State as ServerInfoState } from './serverInfo'
import sortings, { Action as SortingsAction, State as SortingsState } from './sortings'
import workspaceInfo, { Action as WorkspaceInfoAction, State as WorkspaceInfoState } from './workspaceInfo'

export interface RootState {
    databaseConfig: DatabaseConfigState
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
    workspaceInfo: WorkspaceInfoState
>>>>>>> import recordings view python scripts
    hitherJobs: HitherJobsState
    persisting: PersistingState
    recordings: RecordingsState
    serverConnection: ServerConnectionState
    serverInfo: ServerInfoState
    sortings: SortingsState,
    extensionsConfig: ExtensionsConfigState,
    plugins: PluginsState
}
const rootReducer = combineReducers({
    databaseConfig,
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
    workspaceInfo,
>>>>>>> import recordings view python scripts
    hitherJobs,
    persisting,
    recordings,
    serverConnection,
    serverInfo,
    sortings,
    extensionsConfig,
    plugins
})

<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
export type RootAction =  DatabaseConfigAction | HitherJobsAction | PersistingAction | RecordingsAction | ServerConnectionAction | ServerInfoAction | SortingsAction | ExtensionsConfigAction | PluginsAction
=======
export type RootAction =  DatabaseConfigAction | WorkspaceInfoAction | HitherJobsAction | PersistingAction | RecordingsAction | ServerConnectionAction | ServerInfoAction | SortingsAction | ExtensionsConfigAction | PluginsAction
>>>>>>> import recordings view python scripts

export default rootReducer