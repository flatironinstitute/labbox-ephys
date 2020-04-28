import { INIT_FETCH_RECORDING_INFO, RECEIVE_RECORDING_INFO } from '../actions'

const databaseConfig = (state = {}, action) => {
    let state2;
    switch (action.type) {
        case INIT_FETCH_RECORDING_INFO:
            state2 = {...state}
            state2[action.recordingPath] = {fetching: true};
            return state2;
        case RECEIVE_RECORDING_INFO:
            state2 = {...state}
            state2[action.recordingPath] = {fetching: false, error: action.error, recordingInfo: action.recordingInfo};
            return state2;
        default:
            return state
    }
}

export default databaseConfig