import { HitherJob } from "../extensions/extensionInterface"
import { RootAction } from "../reducers"
import { HitherJobUpdate } from "../reducers/hitherJobs"

export const addHitherJob = (job: HitherJob): RootAction => ({
    type: 'ADD_HITHER_JOB',
    job: job
})

export const updateHitherJob = (args: { jobId: string, update: HitherJobUpdate}): RootAction => ({
    type: 'UPDATE_HITHER_JOB',
    jobId: args.jobId,
    update: args.update
})