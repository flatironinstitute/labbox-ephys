import { SET_FRANK_LAB_DATA_JOINT_CONFIG } from '../actions/frankLabDataJointConfig'

const frankLabDataJointConfig = (state = {}, action) => {
    switch (action.type) {
        case SET_FRANK_LAB_DATA_JOINT_CONFIG:
            return action.config;
        default:
            return state
    }
}

export default frankLabDataJointConfig