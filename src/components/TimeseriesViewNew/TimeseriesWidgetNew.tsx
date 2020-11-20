import React, { useCallback, useState } from 'react'
import TimeseriesModel from '../TimeseriesView/TimeseriesModel'
import TimeWidgetNew from '../TimeWidgetNew/TimeWidgetNew'

interface Props {
    timeseriesModel: TimeseriesModel
    num_channels: number
    channel_ids: number[]
    channel_locations: (number[])[]
    num_timepoints: number
    y_offsets: number[]
    y_scale_factor: number
    width: number
    height: number
    leftPanels: any[]
}

const TimeseriesWidgetNew = (props: Props) => {

    const { timeseriesModel, width, height, num_channels } = props
    
    const [currentTime, setCurrentTime] = useState<number | null>(null)
    const [timeRange, setTimeRange] = useState<{min: number, max: number} | null>(null)
    const _handleCurrentTimeChanged = useCallback((t: number | null) => {
        setCurrentTime(t)
    }, [setCurrentTime])
    const _handleTimeRangeChanged = useCallback((tr: {min: number, max: number} | null) => {
        setTimeRange(tr)
    }, [setTimeRange])

    return (
        <TimeWidgetNew
            panels={[]}
            actions={[]}
            width={width}
            height={height}
            samplerate={timeseriesModel.getSampleRate()}
            maxTimeSpan={1e6 / num_channels}
            numTimepoints={timeseriesModel ? timeseriesModel.numTimepoints() : 0}
            currentTime={currentTime}
            timeRange={timeRange}
            onCurrentTimeChanged={_handleCurrentTimeChanged}
            onTimeRangeChanged={_handleTimeRangeChanged}
            // leftPanel={leftPanel}
        />
    )
}

export default TimeseriesWidgetNew