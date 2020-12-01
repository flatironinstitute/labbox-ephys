import { Reducer } from 'react'
import { SET_DATABASE_CONFIG } from '../actions'

export interface DatabaseConfig {

}

export interface SetDatabaseConfigAction {
    type: 'SET_DATABASE_CONFIG'
    databaseConfig: DatabaseConfig
}
const isSetDatabaseConfigAction = (x: any): x is SetDatabaseConfigAction => (
    x.type === SET_DATABASE_CONFIG
)

export type State = DatabaseConfig
export type Action = SetDatabaseConfigAction
const initialState: State = {}

// the reducer
const databaseConfig: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isSetDatabaseConfigAction(action)) {
        return action.databaseConfig
    }
    else {
        return state
    }
}

export default databaseConfig