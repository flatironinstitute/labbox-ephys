import { ADD_JOB_HANDLER, SET_JOB_HANDLER_NAME, DELETE_JOB_HANDLER } from '../actions/jobHandlers'
import { SET_DEFAULT_JOB_HANDLER, SET_SORTING_JOB_HANDLER } from '../actions/jobHandlers'

const jobHandlers = (state = {
    defaultJobHandlerId: null,
    sortingJobHandlerId: null,
    jobHandlers: []
}, action) => {
    switch (action.type) {
        case ADD_JOB_HANDLER:
            if (findJobHandlerById(state, action.jobHandlerId)) {
                throw Error(`Job handler with id already exists: ${action.jobHandlerId}`);
            }
            return {
                ...state,
                jobHandlers: [
                    ...state.jobHandlers,
                    {
                        jobHandlerId: action.jobHandlerId,
                        name: action.name,
                        jobHandlerType: action.jobHandlerType,
                        config: action.config
                    }
                ]
            };
        case SET_JOB_HANDLER_NAME:
            if (!findJobHandlerById(state, action.jobHandlerId)) {
                throw Error(`Unable to find job handler with id: ${action.jobHandlerId}`);
            }
            return {
                ...state,
                jobHandlers: state.jobHandlers.map(jh => (
                    (jh.jobHandlerId === action.jobHandlers) ? { ...jh, name: action.name } : jh
                ))
            };
        case DELETE_JOB_HANDLER:
            if (!findJobHandlerById(state, action.jobHandlerId)) {
                throw Error(`Unable to find job handler with id: ${action.jobHandlerId}`);
            }
            if (state.defaultJobHandlerId === action.jobHandlerId) {
                state.defaultJobHandlerId = null;
            }
            if (state.sortingJobHandlerId === action.jobHandlerId) {
                state.sortingJobHandlerId = null;
            }
            return {
                ...state,
                jobHandlers: state.jobHandlers.filter(jh => (jh.jobHandlerId !== action.jobHandlerId))
            };
        case SET_DEFAULT_JOB_HANDLER:
            if ((action.jobHandlerId !== null) && (!findJobHandlerById(state, action.jobHandlerId))) {
                throw Error(`Unable to find job handler with id: ${action.jobHandlerId}`);
            }
            return {
                ...state,
                defaultJobHandlerId: action.jobHandlerId
            }
        case SET_SORTING_JOB_HANDLER:
            if ((action.jobHandlerId !== null) && (!findJobHandlerById(state, action.jobHandlerId))) {
                throw Error(`Unable to find job handler with id: ${action.jobHandlerId}`);
            }
            return {
                ...state,
                sortingJobHandlerId: action.jobHandlerId
            }
        default:
            return state
    }
}

function findJobHandlerById(state, id) {
    const x = state.jobHandlers.filter(jh => (jh.jobHandlerId === id))[0];
    return x;
}

export default jobHandlers