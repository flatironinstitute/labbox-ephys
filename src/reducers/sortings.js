import { ADD_SORTING, DELETE_SORTINGS } from '../actions'

const sortings = (state = [], action) => {
    switch (action.type) {
        case ADD_SORTING:
            return [
                ...state,
                action.sorting
            ];
        case DELETE_SORTINGS:
            const exclude = Object.fromEntries(action.sortingIds.map(id => [id, true]));
            return state.filter(s => (
                !(s.sortingId in exclude)
            ));
        default:
            return state
    }
}

export default sortings