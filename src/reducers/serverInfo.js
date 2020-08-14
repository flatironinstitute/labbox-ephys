import { SET_NODE_ID } from '../actions'

const serverInfo = (state = {nodeId: null}, action) => {
    switch (action.type) {
        case SET_NODE_ID:
            return {
                ...state,
                nodeId: action.nodeId
            };
        default:
            return state
    }
}

export default serverInfo