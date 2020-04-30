import { ADD_RECORDING, DELETE_RECORDINGS } from '../actions'

const recordings = (state = [], action) => {
    switch (action.type) {
        case ADD_RECORDING:
            return [
                ...state,
                action.recording
            ];
        case DELETE_RECORDINGS:
            const exclude = Object.fromEntries(action.recordingIds.map(id => [id, true]));
            return state.filter(rec => (
                !(rec.recordingId in exclude)
            ));
        default:
            return state
    }
}

export default recordings