import React, { FunctionComponent, ReactElement, useEffect, useRef, useState } from 'react'
import CanvasWidget from '../jscommon/CanvasWidget/CanvasWidgetNew'
import TimeWidgetToolBar from '../TimeWidget/TimeWidgetToolBar'
import { createCursorLayer } from './cursorLayer'
import { createMainLayer } from './mainLayer'
import { createPanelLabelLayer } from './panelLabelLayer'
import Splitter from './Splitter'
import { createTimeAxisLayer } from './timeAxisLayer'
import TimeSpanWidget, { SpanWidgetInfo } from './TimeSpanWidget'
import TimeWidgetBottomBar, { BottomBarInfo } from './TimeWidgetBottomBar'
import { CanvasPainterInterface, TimeWidgetLayerProps } from './timeWidgetLayer'

interface Props {
    panels: TimeWidgetPanel[]
    actions: any[]
    width: number
    height: number
    samplerate: number
    maxTimeSpan: number
    numTimepoints: number
    currentTime: number | null
    timeRange: {min: number, max: number} | null
    onCurrentTimeChanged: (t: number | null) => void
    onTimeRangeChanged: (tr: {min: number, max: number} | null) => void
}

export interface TimeWidgetPanel {
    paint: (painter: CanvasPainterInterface, timeRange: {min: number, max: number}) => void
    label: () => string
    onUpdate: (callback: () => void) => void
}

const toolbarWidth = 50
const spanWidgetHeight = 50

const TimeWidgetNew = (props: Props) => {

    const {panels, width, height, actions, numTimepoints, maxTimeSpan, samplerate, onCurrentTimeChanged, onTimeRangeChanged} = props

    const [spanWidgetInfo, setSpanWidgetInfo] = useState<SpanWidgetInfo>({})
    const [bottomBarInfo, setBottomBarInfo] = useState<BottomBarInfo>({})
    const [bottomBarHeight, setBottomBarHeight] = useState(0)
    const [currentTime, setCurrentTime] = useState<number | null>(null)
    const [timeRange, setTimeRange] = useState<{min: number, max: number} | null>(null)

    const _zoomTime = (fac: number) => {
        // todo
    }

    const _handleKeyLeft = () => {
        // todo
    }
    const _handleKeyRight = () => {
        // todo
    }

    const mainLayer = useRef(createMainLayer()).current
    const timeAxisLayer = useRef(createTimeAxisLayer()).current
    const panelLabelLayer = useRef(createPanelLabelLayer()).current
    const cursorLayer = useRef(createCursorLayer()).current
    
    const layers = [mainLayer, timeAxisLayer, panelLabelLayer, cursorLayer]

    useEffect(() => {
        if ((!timeRange) && (numTimepoints)) {
            const tmax = Math.min(maxTimeSpan, numTimepoints)
            setTimeRange({
                min: 0,
                max: tmax
            })
            setCurrentTime( tmax / 2 )
        }
    })

    // todo: important: figure out how to do this
    panels.forEach(p => {
        p.onUpdate(() => {
            mainLayer.scheduleRepaint()
        })
    })

    const leftPanel = null

    const plotMargins = {
        left: 100,
        top: 50,
        right: 50,
        bottom: 100
    }

    const innerContainer = (
        <InnerContainer>
            <TimeSpanWidget
                key='timespan'
                width={width}
                height={spanWidgetHeight}
                info={spanWidgetInfo}
                onCurrentTimeChanged={onCurrentTimeChanged}
                onTimeRangeChanged={onTimeRangeChanged}
            />
            <CanvasWidget<TimeWidgetLayerProps>
                key='canvas'
                layers={layers}
                widgetProps={{
                    panels,
                    width: width - toolbarWidth,
                    height: height - spanWidgetHeight - bottomBarHeight,
                    timeRange,
                    currentTime,
                    samplerate,
                    margins: plotMargins
                }}
            />
            {/* <CanvasWidget
                
                layers={layers}
                width={this.props.width}
                height={this.props.height - this._spanWidgetHeight - this._bottomBarHeight}
                onMousePress={this.handle_mouse_press}
                onMouseRelease={this.handle_mouse_release}
                onMouseDrag={this.handle_mouse_drag}
                onMouseDragRelease={this.handle_mouse_drag_release}
                onKeyPress={this.handle_key_press}
                menuOpts={{exportSvg: true}}
            /> */}
            <TimeWidgetBottomBar
                key='bottom'
                width={width}
                height={bottomBarHeight}
                info={bottomBarInfo}
                onCurrentTimeChanged={onCurrentTimeChanged}
                onTimeRangeChanged={onTimeRangeChanged}
            />
        </InnerContainer>
    )

    return (
        <OuterContainer
            width={width}
            height={height}
        >
            <TimeWidgetToolBar
                width={toolbarWidth}
                height={height}
                top={spanWidgetHeight}
                onZoomIn={() => {_zoomTime(1.15)}}
                onZoomOut={() => {_zoomTime(1 / 1.15)}}
                onShiftTimeLeft={() => {_handleKeyLeft()}}
                onShiftTimeRight={() => {_handleKeyRight()}}
                customActions={actions}
            />
            <Splitter
                width={width - toolbarWidth}
                height={height}
                left={toolbarWidth}
                onChange={() => {}}
            >
                {
                    leftPanel ? (
                        [leftPanel, innerContainer]
                    ) : (
                        innerContainer
                    )
                }
            </Splitter>
        </OuterContainer>
    );
}

interface InnerContainerProps {
    width?: number
    height?: number
    left?: number
}

const InnerContainer: FunctionComponent<InnerContainerProps> = (props) => {
    const style0 = {
        left: props.left || 0,
        top: 0,
        width: props.width,
        height: props.height
    }
    const ch = props.children as any as ReactElement[]
    return (
        <div className="innerContainer" style={{position: 'relative', ...style0}}>
            {
                ch.map((child, ii) => (
                    <child.type key={ii} {...child.props} width={props.width} />
                ))
            }
        </div>
    )
}

interface OuterContainerProps {
    width: number,
    height: number
}

const OuterContainer: FunctionComponent<OuterContainerProps> = (props) => {
    const style0 = {
        left: 0,
        top: 0,
        width: props.width,
        height: props.height
    }
    return (
        <div className="outerContainer" style={{position: 'relative', ...style0}}>
            {props.children}
        </div>
    )
}

export default TimeWidgetNew