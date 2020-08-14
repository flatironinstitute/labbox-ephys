import { REPORT_INITIAL_LOAD_COMPLETE, SET_WEBSOCKET_STATUS } from '../actions'

const serverConnection = (state = {initialLoadComplete: false, websocketStatus: 'pending'}, action) => {
    switch (action.type) {
        case REPORT_INITIAL_LOAD_COMPLETE:
            return {
                ...state,
                initialLoadComplete: true
            };
        case SET_WEBSOCKET_STATUS:
            return {
                ...state,
                websocketStatus: action.websocketStatus
            };
        default:
            return state
    }
}

export default serverConnection