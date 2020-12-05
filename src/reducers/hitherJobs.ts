import { Reducer } from 'react'
import { ADD_HITHER_JOB, UPDATE_HITHER_JOB } from '../actions/hitherJobs'

export interface HitherJob {
    jobId: string
    functionName: string
    kwargs: {[key: string]: any}
    opts: {[key: string]: any}
    clientJobId: string
    result: any
    runtime_info: {[key: string]: any}
    error_message: string | null
    status: string
    timestampStarted: number
    timestampFinished: number
}

export interface HitherJobUpdate {

}

interface AddHitherJobAction {
    type: 'ADD_HITHER_JOB'
    job: HitherJob
}
const isAddHitherJobAction = (x: any): x is AddHitherJobAction => (
    x.type === ADD_HITHER_JOB
)

interface UpdateHitherJobAction {
    type: 'UPDATE_HITHER_JOB'
    jobId: string
    update: HitherJobUpdate
}
const isUpdateHitherJobAction = (x: any): x is UpdateHitherJobAction => (
    x.type === UPDATE_HITHER_JOB
)

export type State = HitherJob[]
export type Action = AddHitherJobAction | UpdateHitherJobAction
export const initialState: State = []

// the reducer
const hitherJobs: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isAddHitherJobAction(action)) {
        return [
            ...state,
            action.job
        ]
    }
    else if (isUpdateHitherJobAction(action)) {
        return state.map(hj => (
            hj.jobId === action.jobId ? (
                {...hj, ...action.update}
            ) : hj
        ))
    }
    else {
        return state
    }
}

export default hitherJobs