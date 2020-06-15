import { SET_DOCUMENT_ID } from '../actions'

const documentInfo = (state = {}, action) => {
    switch (action.type) {
        case SET_DOCUMENT_ID:
            return {
                ...state,
                documentId: action.documentId
            };
        default:
            return state
    }
}

export default documentInfo