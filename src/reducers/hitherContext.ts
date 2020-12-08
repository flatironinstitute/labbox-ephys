import { Reducer } from 'react'
import { HitherContext } from '../extensions/extensionInterface'
import createHitherJob from './createHitherJob'

export type State = HitherContext
export const initialState: State = {
    createHitherJob: createHitherJob
}

export type Action = {type: 'HitherContextNoAction'}

// the reducer
const hitherContext: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    return state
}

export default hitherContext