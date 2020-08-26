import { SET_SERVER_INFO } from '../actions'

const serverInfo = (state = {nodeId: null, defaultFeedId: null}, action) => {
    switch (action.type) {
        case SET_SERVER_INFO:
            return {
                ...state,
                nodeId: action.nodeId,
                defaultFeedId: action.defaultFeedId
            };
        default:
            return state
    }
}

export default serverInfo