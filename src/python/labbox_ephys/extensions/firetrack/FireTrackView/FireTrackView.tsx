import React, { FunctionComponent, useCallback } from 'react'
import Splitter from '../../common/Splitter'
import { SortingViewProps } from "../../pluginInterface"
import useTimeseriesData from '../../timeseries/TimeseriesViewNew/useTimeseriesModel'
import FireTrackWidget from './FireTrackWidget'

const FireTrackView: FunctionComponent<SortingViewProps> = ({recording, recordingInfo, sorting, selection, selectionDispatch, width, height}) => {
    const handleStopAnimation = useCallback(( args) => {
        selectionDispatch({type: 'SetCurrentTimepointVelocity', velocity: 0})
    }, [ selectionDispatch ])
    const handleStartAnimation = useCallback(( args) => {
        selectionDispatch({type: 'SetCurrentTimepointVelocity', velocity: 50})
    }, [ selectionDispatch ])

    const timeseriesData = useTimeseriesData(recording.recordingObject, recordingInfo)
    return (
        <Splitter
            width={width || 400}
            height={height || 400}
            initialPosition={150}
        >
            <div>
            {
                selection.animation?.currentTimepointVelocity ? (
                    <button onClick={handleStopAnimation}>Stop animation</button>
                ) : (
                    <button onClick={handleStartAnimation}>Start animation</button>
                )
            }
            </div>
            <FireTrackWidget
                {...{recording, timeseriesData, selection}}
                width={0} // filled in by splitter
                height={0} // filled in by splitter
            />
        </Splitter>
    )
}


export default FireTrackView