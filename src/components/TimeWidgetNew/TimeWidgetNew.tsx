import React, { FunctionComponent, ReactElement, useState } from 'react'
import TimeWidgetToolBar from '../TimeWidget/TimeWidgetToolBar'
import Splitter from './Splitter'
import TimeSpanWidget, { SpanWidgetInfo } from './TimeSpanWidget'
import TimeWidgetBottomBar, { BottomBarInfo } from './TimeWidgetBottomBar'

interface Props {
    panels: any[]
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

const toolbarWidth = 50
const spanWidgetHeight = 50

const TimeWidgetNew = (props: Props) => {

    const {width, height, actions, onCurrentTimeChanged, onTimeRangeChanged} = props

    const [spanWidgetInfo, setSpanWidgetInfo] = useState<SpanWidgetInfo>({})
    const [bottomBarInfo, setBottomBarInfo] = useState<BottomBarInfo>({})
    const [bottomBarHeight, setBottomBarHeight] = useState(0)

    const _zoomTime = (fac: number) => {
        // todo
    }

    const _handleKeyLeft = () => {
        // todo
    }
    const _handleKeyRight = () => {
        // todo
    }

    const leftPanel = null

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
            {/* <CanvasWidget
                key='canvas'
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
        <div style={{position: 'relative', ...style0}}>
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
        <div style={{position: 'relative', ...style0}}>
            {props.children}
        </div>
    )
}

export default TimeWidgetNew