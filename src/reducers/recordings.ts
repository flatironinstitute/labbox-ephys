import { Reducer } from 'react'
import { ADD_RECORDING, DELETE_RECORDINGS, SET_RECORDING_INFO } from '../actions'
import { Recording, RecordingInfo } from '../extensions/extensionInterface'
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

export interface SetRecordingInfoAction {
    type: 'SET_RECORDING_INFO'
    recordingId: string
    recordingInfo: RecordingInfo
}
const isSetRecordingInfoAction = (x: any): x is SetRecordingInfoAction => (
    x.type === SET_RECORDING_INFO
)

export type State = Recording[]
export type Action = AddRecordingAction | DeleteRecordingsAction | SetRecordingInfoAction
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
    else if (isSetRecordingInfoAction(action)) {
        return state.map(s => (
            s.recordingId === action.recordingId ? (
                {
                    ...s,
                    recordingInfo: action.recordingInfo
                }
            ): s
        ))
    }
    else {
        return state
    }
}

export default recordings