export const ADD_HITHER_JOB = 'ADD_HITHER_JOB'
export const UPDATE_HITHER_JOB = 'UPDATE_HITHER_JOB'

export const addHitherJob = job => ({
    type: ADD_HITHER_JOB,
    job: job
})

export const updateHitherJob = ({ jobId, update}) => ({
    type: UPDATE_HITHER_JOB,
    jobId,
    update
})