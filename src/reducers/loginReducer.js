import { START_LOGIN, LOGIN_SUCCESS, LOGIN_ERROR } from '../actions/login'

const initialState = {
  loading: false,
  currentUser: null,
  error: null
}

const loginReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case START_LOGIN:
      return { ...state, loading: true };
    case LOGIN_SUCCESS:
      return { ...state, loading: false, currentUser: payload }
    case LOGIN_ERROR:
      return { ...state, loading: false, error: payload }
    default:
      return state
  }
}

export default loginReducer