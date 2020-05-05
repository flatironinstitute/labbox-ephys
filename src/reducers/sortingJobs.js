import { ADD_SORTING_JOB, SET_SORTING_JOB_STATUS, DELETE_SORTING_JOBS } from '../actions'

const sortingJobs = (state = [], action) => {
    switch (action.type) {
        case ADD_SORTING_JOB:
            return [
                ...state,
                {
                    sortingJobId: action.sortingJobId,
                    recordingId: action.recordingId,
                    sorter: action.sorter,
                    status: 'pending'
                }
            ];
        case SET_SORTING_JOB_STATUS:
            return state.map(s => (
                (s.sortingJobId === action.sortingJobId) ?
                    {...s, status: action.status} : s
            ))
        case DELETE_SORTING_JOBS:
            const exclude = Object.fromEntries(action.sortingJobIds.map(id => [id, true]));
            return state.filter(s => (
                !(s.sortingJobId in exclude)
            ));
        default:
            return state
    }
}

export default sortingJobs