import { SET_FRANK_LAB_DATA_JOINT_CONFIG } from './actions'

const frankLabDataJoint = (state = {config: null}, action) => {
    switch (action.type) {
        case SET_FRANK_LAB_DATA_JOINT_CONFIG:
            return {
                ...state,
                config: action.config
            }
        default:
            return state
    }
}

export default frankLabDataJoint