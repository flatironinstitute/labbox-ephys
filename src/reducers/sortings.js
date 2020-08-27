import { ADD_SORTING, DELETE_SORTINGS, DELETE_ALL_SORTINGS_FOR_RECORDINGS, SET_SORTING_INFO, ADD_UNIT_LABEL, REMOVE_UNIT_LABEL } from '../actions'

const setAdd = (thelist = [], item) => {
    return thelist.filter(l => (l !== item)).concat(item).sort()
}

const setRemove = (thelist = [], item) => {
    return thelist.filter(l => (l !== item)).sort()
}

const unitCurationReducer = (curation = { }, action) => {
    // returns object corresponding to the value of the 'unitCuration' key of a sorting.
    if (action.type !== ADD_UNIT_LABEL && action.type !== REMOVE_UNIT_LABEL) {
        return { ...curation }
    }
    return {
        ...curation,
        [action.unitId]: {
            ...(curation[action.unitId] || {}),
            labels: unitLabelReducer((curation[action.unitId] || {}).labels, action)
        }
    }
}

const unitLabelReducer = (labels = [], action) => {
    if (action.type === ADD_UNIT_LABEL) {
        return setAdd(labels, action.label);
    }
    if (action.type === REMOVE_UNIT_LABEL) {
        return setRemove(labels, action.label);
    }
}

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
        case DELETE_ALL_SORTINGS_FOR_RECORDINGS:
            const excludeRecordingIds = Object.fromEntries(action.recordingIds.map(id => [id, true]));
            return state.filter(s => (
                !(s.recordingId in excludeRecordingIds)
            ));
        case SET_SORTING_INFO:
            {
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
            }
        case ADD_UNIT_LABEL:
        case REMOVE_UNIT_LABEL:
            {
                console.log(`executing deep add/removeUnitLabel: ${Date.now()}.`)
                const s = state.filter(s => (s.sortingId === action.sortingId))[0];
                if (!s) {
                    throw Error(`Sorting not found: ${action.sortingId}`);
                }
                return [
                    ...state.filter(s => (s.sortingId !== action.sortingId)),
                    {
                        ...s,
                        unitCuration: unitCurationReducer(s.unitCuration, action)
                    }
                ];
            }
        default:
            return state
    }
}

export default sortings