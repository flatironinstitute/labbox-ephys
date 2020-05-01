import { INIT_FETCH_RECORDING_INFO, RECEIVE_RECORDING_INFO } from '../actions'

const recordingInfoByPath = (state = {}, action) => {
    switch (action.type) {
        case INIT_FETCH_RECORDING_INFO:
            return {
                ...state,
                ...{ [action.recordingPath]: { fetching: true } }
            };
        case RECEIVE_RECORDING_INFO:
            return {
                ...state,
                ...{
                    [action.recordingPath]: {
                        fetching: false,
                        error: action.error,
                        errorMessage: action.errorMessage,
                        recordingInfo: action.recordingInfo
                    }
                }
            }
        default:
            return state
    }
}

export default recordingInfoByPath