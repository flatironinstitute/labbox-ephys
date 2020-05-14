import { ADD_SORTING_JOB, SET_SORTING_JOB_STATUS, CANCEL_SORTING_JOBS, CANCEL_ALL_SORTING_JOBS_FOR_RECORDINGS } from '../actions'

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
        case CANCEL_SORTING_JOBS:
            const exclude = Object.fromEntries(action.sortingJobIds.map(id => [id, true]));
            return state.filter(s => (
                !(s.sortingJobId in exclude)
            ));
        case CANCEL_ALL_SORTING_JOBS_FOR_RECORDINGS:
            const excludeRecordingIds = Object.fromEntries(action.recordingIds.map(id => [id, true]));
            return state.filter(s => (
                !(s.recordingId in excludeRecordingIds)
            ));
        default:
            return state
    }
}

export default sortingJobs