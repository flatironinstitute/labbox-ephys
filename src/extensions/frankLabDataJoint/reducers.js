import { SET_FRANK_LAB_DATA_JOINT_CONFIG } from './actions'

const frankLabDataJoint = (state = {}, action) => {
    switch (action.type) {
        case SET_FRANK_LAB_DATA_JOINT_CONFIG:
            return action.config
        default:
            return state
    }
}

export default frankLabDataJoint