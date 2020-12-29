import React, { FunctionComponent, useCallback } from 'react'
import { SortingViewProps } from "../../extensionInterface"

const FireTrackView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, selectionDispatch}) => {
    const handleStopAnimation = useCallback(( args) => {
        selectionDispatch({type: 'SetCurrentTimepointVelocity', velocity: 0})
    }, [ selectionDispatch ])
    const handleStartAnimation = useCallback(( args) => {
        selectionDispatch({type: 'SetCurrentTimepointVelocity', velocity: 200})
    }, [ selectionDispatch ])
    return (
        <div>
            {
                selection.animation?.currentTimepointVelocity ? (
                    <button onClick={handleStopAnimation}>Stop animation</button>
                ) : (
                    <button onClick={handleStartAnimation}>Start animation</button>
                )
            }
            
        </div>
    )
}

export default FireTrackView