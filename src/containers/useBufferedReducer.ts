import { useMemo, useRef, useState } from "react"

const useBufferedReducer = <State, Action>(reducer: (s: State, a: Action) => State, initialState: State, t: number): [State, (a: Action) => void] => {
    const state = useRef<State>(initialState)
    const [count, setCount] = useState<number>(0)
    const lastUpdateTimestamp = useRef<number>(0)
    const scheduled = useRef<boolean>(false)
    const lastReturnedState = useRef<State>(initialState)
    const dispatch = useMemo(() => ((a: Action) => {
        const check = () => {
            const elapsed = Number(new Date()) - lastUpdateTimestamp.current
            if (elapsed > t) {
                lastUpdateTimestamp.current = Number(new Date())
                lastReturnedState.current = state.current
                setCount(c => (c+1))
            }
            else {
                if (!scheduled.current) {
                    scheduled.current = true
                    setTimeout(() => {
                        scheduled.current = false
                        check()
                    }, t - elapsed + 1)
                }
            }
        }
        state.current = reducer(state.current, a)
        check()
    }), [reducer, t])
    return [lastReturnedState.current, dispatch]    
}

export default useBufferedReducer