export const ADD_JOB_HANDLER = 'ADD_JOB_HANDLER'
export const SET_JOB_HANDLER_NAME = 'SET_JOB_HANDLER_NAME'
export const DELETE_JOB_HANDLER = 'DELETE_JOB_HANDLER'
export const ASSIGN_JOB_HANDLER_TO_ROLE = 'ASSIGN_JOB_HANDLER_TO_ROLE'

export const addJobHandler = ({ jobHandlerId, name, jobHandlerType, config }) => ({
    type: ADD_JOB_HANDLER,
    jobHandlerId,
    name,
    jobHandlerType: jobHandlerType,
    config
})

export const setJobHandlerName = (jobHandlerId, name) => ({
    type: SET_JOB_HANDLER_NAME,
    jobHandlerId,
    name
})

export const deleteJobHandler = (jobHandlerId) => ({
    type: DELETE_JOB_HANDLER,
    jobHandlerId
})

export const assignJobHandlerToRole = ({ jobHandlerId, role }) => ({
    type: ASSIGN_JOB_HANDLER_TO_ROLE,
    jobHandlerId,
    role
})