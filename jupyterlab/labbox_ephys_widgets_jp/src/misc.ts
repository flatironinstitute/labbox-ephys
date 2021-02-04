import { useEffect, useMemo, useReducer, useRef } from 'react';

export interface AppendOnlyLog {
    appendMessage: (msg: any) => void
    allMessages: () => any[]
    onMessage: (callback: (msg: any) => void) => void
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

// thanks: https://usehooks-typescript.com/react-hook/use-interval
export const useInterval = (callback: () => void, delay: number | null) => {
    const savedCallback = useRef<() => void | null>()
    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback
    })
    // Set up the interval.
    useEffect(() => {
        function tick() {
            if (typeof savedCallback?.current !== 'undefined') {
                savedCallback?.current()
            }
        }
        if (delay !== null) {
            const id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}