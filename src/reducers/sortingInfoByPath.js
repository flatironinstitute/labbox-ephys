import { INIT_FETCH_SORTING_INFO, RECEIVE_SORTING_INFO } from '../actions'

const sortingInfoByPath = (state = {}, action) => {
    switch (action.type) {
        case INIT_FETCH_SORTING_INFO:
            return {
                ...state,
                ...{ [action.sortingPath + '::::' + action.recordingPath]: { fetching: true } }
            };
        case RECEIVE_SORTING_INFO:
            return {
                ...state,
                ...{
                    [action.sortingPath + '::::' + action.recordingPath]: {
                        fetching: false,
                        error: action.error,
                        errorMessage: action.errorMessage,
                        sortingInfo: action.sortingInfo
                    }
                }
            }
        default:
            return state
    }
}

export default sortingInfoByPath