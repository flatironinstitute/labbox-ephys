import { ADD_SORTING, DELETE_SORTINGS, SET_SORTING_INFO } from '../actions'

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
        case SET_SORTING_INFO:
            const s = state.filter(s => (s.sortingId === action.sortingId))[0];
            if (!s) {
                throw Error(`Sorting not found: ${action.sortingId}`);
            }
            return [
                ...state.filter(s => (s.sortingId !== action.sortingId)),
                {
                    ...s,
                    sortingInfo: action.sortingInfo
                }
            ];
        default:
            return state
    }
}

export default sortings