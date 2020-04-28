import { SET_DATABASE_CONFIG } from '../actions'

const databaseConfig = (state = {}, action) => {
    switch (action.type) {
        case SET_DATABASE_CONFIG:
            return action.databaseConfig;
        default:
            return state
    }
}

export default databaseConfig