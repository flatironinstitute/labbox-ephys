import { HitherJob } from "../extensions/common/hither"
import { RootAction } from "../reducers"
import { HitherJobUpdate } from "../reducers/hitherJobs"

export const addHitherJob = (job: HitherJob): RootAction => ({
    type: 'ADD_HITHER_JOB',
    job: job
})

export const updateHitherJob = (args: { clientJobId: string, update: HitherJobUpdate}): RootAction => ({
    type: 'UPDATE_HITHER_JOB',
    clientJobId: args.clientJobId,
    update: args.update
})