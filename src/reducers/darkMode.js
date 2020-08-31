import { SET_DARK_MODE } from '../actions'

const darkMode = (state = { status: false }, action) => {
    switch (action.type) {
        case SET_DARK_MODE:
            return {
                ...state,
                status: action.status
            };
        default:
            return state
    }
}

export default darkMode