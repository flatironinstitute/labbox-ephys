import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
import { PainterPath } from '../jscommon/CanvasWidget'
import { CanvasPainter } from '../jscommon/CanvasWidget/CanvasPainter'
import TimeWidgetNew, { TimeWidgetAction } from '../TimeWidgetNew/TimeWidgetNew'
import TimeseriesModelNew from './TimeseriesModelNew'

interface Props {
    timeseriesModel: TimeseriesModelNew
    channel_ids: number[]
    channel_locations: (number[])[]
    num_timepoints: number
    y_offsets: number[]
    y_scale_factor: number
    width: number
    height: number
    leftPanels: any[]
}

const channelColors = [
    'rgb(80,80,80)',
    'rgb(104,42,42)',
    'rgb(42,104,42)',
    'rgb(42,42,152)'
]


class Panel {
    #updateHandler: (() => void) | null = null
    #timeRange: {min: number, max: number} | null = null
    #yScale: number = 1
    #pixelWidth: number | null = null // for determining the downsampling factor
    constructor(private channelIndex: number, private channelId: number, private timeseriesModel: TimeseriesModelNew, private y_offset: number, private y_scale_factor: number) {
        timeseriesModel.onDataSegmentSet((ds_factor, t1, t2) => {
            const timeRange = this.#timeRange
            if (!timeRange) return
            if ((t1 <= timeRange.max) && (t2 >= timeRange.min)) {
                this.#updateHandler && this.#updateHandler()
            }
        })
    }
    setTimeRange(timeRange: {min: number, max: number}) {
        this.#timeRange = timeRange
    }
    setYScale(s: number) {
        if (this.#yScale === s) return
        this.#yScale = s
        this.#updateHandler && this.#updateHandler()
    }
    setPixelWidth(w: number) {
        if (this.#pixelWidth === w) return
        this.#pixelWidth = w
        this.#updateHandler && this.#updateHandler()
    }
    paint(painter: CanvasPainter, completenessFactor: number) {
        const timeRange = this.#timeRange
        if (!timeRange) return

        const downsample_factor = this._determineDownsampleFactor(completenessFactor)
        if (downsample_factor === null) return

        const t1 = timeRange.min
        const t2 = timeRange.max
        let t1b = Math.floor(t1 / downsample_factor);
        let t2b = Math.floor(t2 / downsample_factor);

        const data: number[] = this.timeseriesModel.getChannelData(this.channelIndex, t1b, t2b, downsample_factor) // todo: ds factor
        if (data.filter(x => (!isNaN(x))).length === 0) return
        if (data.filter(x => (isNaN(x))).length > 0) {
            this.timeseriesModel.requestChannelData(this.channelIndex, t1b, t2b, downsample_factor) // todo: ds factor
        }

        const pp = new PainterPath()
        if (downsample_factor === 1) {
            let penDown = false;
            for (let tt = t1; tt < t2; tt++) {
                let val = data[tt - t1];
                if (!isNaN(val)) {
                    let val2 = ((val + this.y_offset) * this.y_scale_factor * this.#yScale) / 2 + 0.5
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
        }
        else {
            let penDown = false;
            for (let tt = t1b; tt < t2b; tt++) {
                let val_min = data[(tt - t1b) * 2];
                let val_max = data[(tt - t1b) * 2 + 1];
                if ((!isNaN(val_min)) && (!isNaN(val_max))) {
                    let val2_min = ((val_min + this.y_offset) * this.y_scale_factor * this.#yScale) / 2 + 0.5
                    let val2_max = ((val_max + this.y_offset) * this.y_scale_factor * this.#yScale) / 2 + 0.5
                    if (penDown) {
                        pp.lineTo((tt - 1/3) * downsample_factor, val2_min);
                        pp.lineTo((tt + 1/3) * downsample_factor, val2_max);
                    }
                    else {
                        pp.moveTo((tt - 1/3) * downsample_factor, val2_min);
                        pp.lineTo((tt + 1/3) * downsample_factor, val2_max);
                        penDown = true;
                    }
                }
                else {
                    penDown = false;
                }
            }
        }

        const color = channelColors[this.channelIndex % channelColors.length]
        const pen = {color, width: 1}
        painter.drawPath(pp, pen)
    }
    _determineDownsampleFactor(completenessFactor: number) {
        let timeRange = this.#timeRange
        if (!timeRange) return null
        if (this.#pixelWidth === null) return null
        const numChannels = this.timeseriesModel.numChannels()
        let factor0 = 1.3; // this is a tradeoff between rendering speed and appearance
        if (numChannels > 32) {
            factor0 = 0.5;
        }

        // determine what the downsample factor should be based on the number
        // of timepoints in the view range
        // we also need to consider the number of pixels it corresponds to
        const targetNumPix = Math.max(500, this.#pixelWidth * factor0) * completenessFactor
        const numPoints = timeRange.max - timeRange.min
        let ds_factor = 1;
        let factor = 3;
        while (numPoints / (ds_factor * factor) > targetNumPix) {
            ds_factor *= factor
        }
        return ds_factor;
    }
    label() {
        return this.channelId + ''
    }
    register(onUpdate: () => void) {
        this.#updateHandler = onUpdate
    }
}

interface YScaleState {
    yScale: number
}

interface YScaleAction {
    scaleFactor: number
}

const yScaleReducer = (state: YScaleState, action: YScaleAction): YScaleState => {
    return {
        yScale: state.yScale * action.scaleFactor
    }
}

const TimeseriesWidgetNew = (props: Props) => {
    const { timeseriesModel, width, height, y_offsets, y_scale_factor, channel_ids } = props
    const [panels, setPanels] = useState<Panel[]>([])
    const [prevTimeseriesModel, setPrevTimeseriesModel] = useState<TimeseriesModelNew | null>(null)
    const [currentTime, setCurrentTime] = useState<number | null>(null)
    const [timeRange, setTimeRange] = useState<{min: number, max: number} | null>(null)
    const [yScaleState, yScaleDispatch] = useReducer(yScaleReducer, {yScale: 1})
    const [prevYScale, setPrevYScale] = useState<number>(1)
    const _handleCurrentTimeChanged = useCallback((t: number | null) => {
        setCurrentTime(t)
    }, [setCurrentTime])
    const _handleTimeRangeChanged = useCallback((tr: {min: number, max: number} | null) => {
        setTimeRange(tr)
    }, [setTimeRange])
    const [actions, setActions] = useState<TimeWidgetAction[] | null>(null)
    const _handleScaleAmplitudeUp = useCallback(() => {
        yScaleDispatch({scaleFactor: 1.15})
    }, [yScaleDispatch])
    const _handleScaleAmplitudeDown = useCallback(() => {
        yScaleDispatch({scaleFactor: 1 / 1.15})
    }, [yScaleDispatch])

    useEffect(() => {
        if (timeseriesModel !== prevTimeseriesModel) {
            // we only want to do this once (as a function of the timeseries model)
            const panels0: Panel[] = []
            for (let ch = 0; ch < timeseriesModel.numChannels(); ch ++) {
                // todo: i guess we need to redefine the panels whenever y_offsets or y_scale_factor or channel_ids change
                const p = new Panel(ch, channel_ids[ch], timeseriesModel, y_offsets[ch], y_scale_factor)
                panels0.push(p)
            }
            setPanels(panels0)
            setPrevTimeseriesModel(timeseriesModel)
        }
    }, [channel_ids, setPanels, setPrevTimeseriesModel, timeseriesModel, prevTimeseriesModel, y_offsets, y_scale_factor])
    useEffect(() => {
        if (actions === null) {
            const a: TimeWidgetAction[] = [
                {
                    type: 'button',
                    callback: _handleScaleAmplitudeUp,
                    title: 'Scale amplitude up [up arrow]',
                    icon: <FaArrowUp />,
                    keyCode: 38
                },
                {
                    type: 'button',
                    callback: _handleScaleAmplitudeDown,
                    title: 'Scale amplitude down [down arrow]',
                    icon: <FaArrowDown />,
                    keyCode: 40
                },
                {
                    type: 'divider'
                }
            ]
            setActions(a)
        }
    }, [actions, setActions, _handleScaleAmplitudeDown, _handleScaleAmplitudeUp])
    useEffect(() => {
        if (yScaleState.yScale !== prevYScale) {
            if (panels) {
                panels.forEach(p => {
                    p.setYScale(yScaleState.yScale)
                })
            }
            setPrevYScale(yScaleState.yScale)
        }
    }, [yScaleState, setPrevYScale, prevYScale, panels])

    if (panels) {
        panels.forEach(p => {
            p.setPixelWidth(width)
        })
    }

    return (
        <TimeWidgetNew
            panels={panels}
            customActions={actions || []}
            width={width}
            height={height}
            samplerate={timeseriesModel.getSampleRate()}
            startTimeSpan={1e7 / timeseriesModel.numChannels()}
            maxTimeSpan={1e7 / timeseriesModel.numChannels()}
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