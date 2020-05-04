import { SET_PERSIST_STATUS } from '../actions'

const persisting = (state = {status: 'initial'}, action) => {
    switch (action.type) {
        case SET_PERSIST_STATUS:
            return {
                ...state,
                status: action.status
            };
        default:
            return state
    }
}

export default persisting