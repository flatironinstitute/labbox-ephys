export const SET_FRANK_LAB_DATA_JOINT_CONFIG = 'SET_FRANK_LAB_DATA_JOINT_CONFIG'

export const setFrankLabDataJointConfig = config => ({
    type: SET_FRANK_LAB_DATA_JOINT_CONFIG,
    config,
    persistKey: 'extensionsConfig'
})
