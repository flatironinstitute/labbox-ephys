import { Reducer } from 'react'
import { ADD_RECORDING, DELETE_RECORDINGS } from '../actions'
import { Recording } from '../extensions/extensionInterface'
export type { Recording, RecordingInfo } from '../extensions/extensionInterface'

export interface AddRecordingAction {
    type: 'ADD_RECORDING'
    recording: Recording
}
const isAddRecordingAction = (x: any): x is AddRecordingAction => (
    x.type === ADD_RECORDING
)

export interface DeleteRecordingsAction {
    type: 'DELETE_RECORDINGS'
    recordingIds: string[]
}
export const isDeleteRecordingsAction = (x: any): x is DeleteRecordingsAction => (
    x.type === DELETE_RECORDINGS
)

export type State = Recording[]
export type Action = AddRecordingAction | DeleteRecordingsAction
export const initialState: State = []

// the reducer
const recordings: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isAddRecordingAction(action)) {
        return [
            ...state,
            action.recording
        ]
    }
    else if (isDeleteRecordingsAction(action)) {
        const exclude = Object.fromEntries(action.recordingIds.map(id => [id, true]));
        return state.filter(s => (
            !(s.recordingId in exclude)
        ));
    }
    else {
        return state
    }
}

export default recordings