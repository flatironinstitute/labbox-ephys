import { CanvasPainter, Pen } from "../jscommon/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer } from "../jscommon/CanvasWidget/CanvasWidgetLayer"
import { Point2D, TimeWidgetLayerProps, transformPainter } from "./timeWidgetLayer"

type Layer = CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>

interface LayerState {

}

const onPaint = (painter: CanvasPainter, layerProps: TimeWidgetLayerProps, state: LayerState) => {
    const { currentTime, timeRange, samplerate, width, height, margins } = layerProps
    if (!timeRange) return
    if (currentTime === null) return

    if (currentTime < timeRange.min) return
    if (currentTime > timeRange.max) return

    const pen: Pen = {color: 'blue', width: 2}

    const transformation = (p: Point2D): Point2D => {
        const xfrac = (p.x - timeRange.min) / (timeRange.max - timeRange.min)
        const yfrac = p.y
        const x = margins.left + xfrac * (width - margins.left - margins.right)
        const y = height - margins.bottom - yfrac * (height - margins.bottom - margins.top)
        return {x, y}
    }

    const painter2 = transformPainter(painter, transformation)

    painter2.drawLine(currentTime, 0, currentTime, 1, pen)
}

const onPropsChange = (layer: Layer, layerProps: TimeWidgetLayerProps) => {
}

export const createCursorLayer = () => {
    return new CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>(onPaint, onPropsChange)
}