import { UPDATE_PAGE_SIZE } from './actions'

const initialState = {
  pageSize: 5
}

const virtualGridState = (state = initialState, { type, payload }) => {
  switch (type) {
    case UPDATE_PAGE_SIZE:
      return { ...state, pageSize: payload };
    default:
      return state
  }
}

export default virtualGridState