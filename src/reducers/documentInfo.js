import { SET_DOCUMENT_ID, SET_FEED_ID } from '../actions'

const documentInfo = (state = {documentId: null, feedId: null}, action) => {
    switch (action.type) {
        case SET_DOCUMENT_ID:
            return {
                ...state,
                documentId: action.documentId
            };
        case SET_FEED_ID:
            return {
                ...state,
                feedId: action.feedId
            };
        default:
            return state
    }
}

export default documentInfo