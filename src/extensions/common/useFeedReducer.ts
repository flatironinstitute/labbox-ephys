import { useEffect, useMemo, useReducer } from "react"

export interface AppendOnlyLog {
    appendMessage: (msg: any) => void
    allMessages: () => any[]
    onMessage: (callback: (msg: any) => void) => void
}

export const dummyAppendOnlyLog = {
  appendMessage: (msg: any) => {},
  allMessages: () => ([]),
  onMessage: (callback: (msg: any) => void) => {}
}

export const useFeedReducer = <State, Action>(reducer: (s: State, a: Action) => State, initialState: State, subfeed: AppendOnlyLog | null): [State, (a: Action) => void] => {
    const [state, stateDispatch] = useReducer(reducer, initialState)
  
    useEffect(() => {
      if (subfeed) {
        subfeed.allMessages().forEach(msg => {
          stateDispatch(msg)
        })
        subfeed.onMessage(msg => {
          stateDispatch(msg)
        })
      }
    }, [subfeed])
  
    const newDispatch = useMemo(() => ((a: Action) => {
      if (subfeed) {
        subfeed.appendMessage(a)
      }
      else {
        stateDispatch(a)
      }
    }), [subfeed])
  
    return [state, newDispatch]
}