import { SET_DOCUMENT_INFO } from '../actions'

const documentInfo = (state = {documentId: null, feedUri: null, readonly: null}, action) => {
    switch (action.type) {
        case SET_DOCUMENT_INFO:
            return {
                ...action.documentInfo
            };
        default:
            return state
    }
}

export default documentInfo