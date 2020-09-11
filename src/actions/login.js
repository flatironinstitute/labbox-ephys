export const START_LOGIN = 'START_LOGIN'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_ERROR = 'LOGIN_ERROR'

export const initLogin = () => ({ type: START_LOGIN })
export const loginSuccess = (user) => ({ type: LOGIN_SUCCESS, payload: user })
export const loginError = ({ error }) => ({ type: LOGIN_ERROR, error })