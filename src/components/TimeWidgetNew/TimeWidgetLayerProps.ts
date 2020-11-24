import { BaseLayerProps } from "../jscommon/CanvasWidget/CanvasWidgetLayer";
import { TimeWidgetPanel } from "./TimeWidgetNew";

export interface TimeWidgetLayerProps extends BaseLayerProps {
    panels: TimeWidgetPanel[]
    currentTime: number | null
    timeRange: {min: number, max: number} | null
    samplerate: number
    margins: {left: number, right: number, top: number, bottom: number}
    onClick: (args: {timepoint: number, panelIndex: number, y: number}) => void
    onDrag: (args: {newTimeRange: {min: number, max: number}}) => void
}

export interface Point2D {
    x: number,
    y: number
}