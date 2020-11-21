import React, { useCallback, useState } from 'react'
import { PainterPath } from '../jscommon/CanvasWidget'
import TimeseriesModel from '../TimeseriesView/TimeseriesModel'
import { CanvasPainterInterface } from '../TimeWidgetNew/timeWidgetLayer'
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

class Panel {
    #onUpdateCallbacks: (() => void)[] = []
    constructor(private channelIndex: number, private channelId: number, private timeseriesModel: TimeseriesModel, private y_offset: number, private y_scale_factor: number) {

    }
    paint(painter: CanvasPainterInterface, timeRange: {min: number, max: number}) {
        painter.drawLine(timeRange.min, 0, timeRange.max, 1, {color: 'green'})
        const t1 = timeRange.min
        const t2 = timeRange.max
        const data: number[] = this.timeseriesModel.getChannelData(this.channelIndex, t1, t2, 1, {})
        if (data.filter(x => (!isNaN(x))).length === 0) return

        const pp = new PainterPath()
        let penDown = false;
        for (let tt = t1; tt < t2; tt++) {
            let val = data[tt - t1];
            if (!isNaN(val)) {
                let val2 = ((val + this.y_offset) * this.y_scale_factor) / 2 + 0.5; // to
                if (penDown) {
                    pp.lineTo(tt, val2);    
                }
                else {
                    pp.moveTo(tt, val2);
                    penDown = true;
                }
            }
            else {
                penDown = false;
            }
        }
        const pen = {color: 'purple'}
        painter.drawPath(pp, pen)
    }
    label() {
        return this.channelId + ''
    }
    update() {
        this.#onUpdateCallbacks.forEach(cb => {cb()})
    }
    onUpdate(callback: () => void) {
        this.#onUpdateCallbacks.push(callback)
    }
}

const TimeseriesWidgetNew = (props: Props) => {

    const { timeseriesModel, width, height, num_channels, y_offsets, y_scale_factor } = props
    
    const [currentTime, setCurrentTime] = useState<number | null>(null)
    const [timeRange, setTimeRange] = useState<{min: number, max: number} | null>(null)
    const _handleCurrentTimeChanged = useCallback((t: number | null) => {
        setCurrentTime(t)
    }, [setCurrentTime])
    const _handleTimeRangeChanged = useCallback((tr: {min: number, max: number} | null) => {
        setTimeRange(tr)
    }, [setTimeRange])

    const panels: Panel[] = []
    for (let ch = 0; ch < num_channels; ch ++) {
        const p = new Panel(ch, props.channel_ids[ch], timeseriesModel, y_offsets[ch], y_scale_factor)
        panels.push(p)
    }

    // todo: important -- think about this -- when should it get registered????
    timeseriesModel.onDataSegmentSet((ds_factor: number, t1: number, t2: number) => {
        if (!timeRange) return;
        if ((t1 <= timeRange.max) && (t2 >= timeRange.min)) {
            // if the new chunk is in range of what we are viewing, we repaint
            panels.forEach(p => {
                p.update()
            })
        }
    });

    return (
        <TimeWidgetNew
            panels={panels}
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