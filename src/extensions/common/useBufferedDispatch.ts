import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const useBufferedDispatch = <State, Action>(reducer: (s: State, a: Action) => State, state: State, setState: (s: State) => void, t: number): [State, (a: Action) => void] => {
    const [count, setCount] = useState(0) // for triggering state changes (and re-calling this hook)
    const ref = useRef<{
        internalState: State,
        internalStateDispatched: boolean,
        externalState: State,
        lastInternalDispatchTimestamp: number,
        externalStateTimestamp: number,
        dispatchScheduled: boolean,
        updateInternalStateScheduled: boolean
    }>({
        internalState: state,
        internalStateDispatched: true,
        externalState: state,
        lastInternalDispatchTimestamp: Number(new Date()),
        externalStateTimestamp: Number(new Date()),
        dispatchScheduled: false,
        updateInternalStateScheduled: false
    })

    const update = useCallback(() => {
        if (!ref.current.internalStateDispatched) {
            const now = Number(new Date())
            const elapsedSinceLastInternalDispatch = now - ref.current.lastInternalDispatchTimestamp
            if (elapsedSinceLastInternalDispatch > t) {
                setState(ref.current.internalState)
                ref.current.internalStateDispatched = true
            }
            else {
                if (!ref.current.dispatchScheduled) {
                    ref.current.dispatchScheduled = true
                    setTimeout(() => {
                        ref.current.dispatchScheduled = false
                        update()
                    }, t - elapsedSinceLastInternalDispatch + 1)
                }
            }
        }
        if ((ref.current.externalState !== ref.current.internalState) && (ref.current.externalStateTimestamp > ref.current.lastInternalDispatchTimestamp)) {
            const now = Number(new Date())
            const elapsedSinceLastInternalDispatch = now - ref.current.lastInternalDispatchTimestamp
            if (elapsedSinceLastInternalDispatch > t) {
                ref.current.internalState = ref.current.externalState
                setCount((c) => (c + 1)) // triggers state change and calling this hook again to return the new internal state
            }
            else {
                if (!ref.current.updateInternalStateScheduled) {
                    ref.current.updateInternalStateScheduled = true
                    setTimeout(() => {
                        ref.current.updateInternalStateScheduled = false
                        update()
                    }, t- elapsedSinceLastInternalDispatch + 1)
                }
            }
        }
    }, [t, setState])

    useEffect(() => {
        if (ref.current.externalState !== state) {
            ref.current.externalState = state
            ref.current.externalStateTimestamp = Number(new Date())
            update()
        }
    }, [state, update])

    const newState = ref.current.internalState
    const newDispatch = useMemo(() => ((a: Action) => {
        const newInternalState = reducer(ref.current.internalState, a)
        if (newInternalState !== ref.current.internalState) {
            ref.current.internalState = newInternalState
            ref.current.lastInternalDispatchTimestamp = Number(new Date())
            ref.current.internalStateDispatched = false
            update()
            setCount((c) => (c + 1)) // triggers state change and calling this hook again to return the new internal state
        }
    }), [reducer, update])

    return [newState, newDispatch]
}

export default useBufferedDispatch