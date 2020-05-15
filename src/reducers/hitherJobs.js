import { ADD_HITHER_JOB, UPDATE_HITHER_JOB } from '../actions/hitherJobs'

const hitherJobs = (state = [], action) => {
    switch (action.type) {
        case ADD_HITHER_JOB:
            return [
                ...state,
                action.job
            ];
        case UPDATE_HITHER_JOB:
            const j = state.filter(j => (j.jobId === action.jobId))[0];
            if (!j) throw Error(`Unable to find job with id: ${action.jobId}`);
            return [
                ...state.filter(j => (j.jobId !==action.jobId)),
                {
                    ...j,
                    ...action.update
                }
            ]
        default:
            return state
    }
}

export default hitherJobs