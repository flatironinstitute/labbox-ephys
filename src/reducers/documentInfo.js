import { SET_DOCUMENT_ID, SET_FEED_URI } from '../actions'

const documentInfo = (state = {documentId: null, feedUri: null}, action) => {
    switch (action.type) {
        case SET_DOCUMENT_ID:
            return {
                ...state,
                documentId: action.documentId
            };
        case SET_FEED_URI:
            return {
                ...state,
                feedUri: action.feedUri
            };
        default:
            return state
    }
}

export default documentInfo