import { INITIAL_LOAD } from '../actions'

const initialLoad = (state = {}, action) => {
    switch (action.type) {
        case INITIAL_LOAD:
            return {
                ...state,
                [action.key]: true
            };
        default:
            return state
    }
}

export default initialLoad