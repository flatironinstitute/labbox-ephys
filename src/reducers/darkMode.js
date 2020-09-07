import { SET_DARK_MODE } from '../actions'

const darkMode = (state = false, { type }) => {
    switch (type) {
        case SET_DARK_MODE:
            return !state;
        default:
            return state
    }
}

export default darkMode