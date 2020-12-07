import { Reducer } from 'react'
import { HitherJob } from '../extensions/extensionInterface'

export interface HitherJobUpdate {

}

interface AddHitherJobAction {
    type: 'ADD_HITHER_JOB'
    job: HitherJob
}
const isAddHitherJobAction = (x: any): x is AddHitherJobAction => (
    x.type === 'ADD_HITHER_JOB'
)

interface UpdateHitherJobAction {
    type: 'UPDATE_HITHER_JOB'
    jobId: string
    update: HitherJobUpdate
}
const isUpdateHitherJobAction = (x: any): x is UpdateHitherJobAction => (
    x.type === 'UPDATE_HITHER_JOB'
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