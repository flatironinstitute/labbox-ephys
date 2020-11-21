import { CanvasPainter } from "../jscommon/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer } from "../jscommon/CanvasWidget/CanvasWidgetLayer"
import { Point2D, TimeWidgetLayerProps, transformPainter } from "./timeWidgetLayer"

type Layer = CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>

interface LayerState {

}

const onPaint = (painter: CanvasPainter, layerProps: TimeWidgetLayerProps, state: LayerState) => {
    const { panels, timeRange, width, height, margins } = layerProps
    if (!timeRange) return
    if (panels.length === 0) return

    for (let i = 0; i < panels.length; i++) {
        const transformation = (p: Point2D): Point2D => {
            const xfrac = (p.x - timeRange.min) / (timeRange.max - timeRange.min)
            const yfrac = (i / panels.length) + p.y * (1 / panels.length)
            const x = margins.left + xfrac * (width - margins.left - margins.right)
            const y = height - margins.bottom - yfrac * (height - margins.bottom - margins.top)
            return {x, y}
        }
        const painter2 = transformPainter(painter, transformation)
        panels[i].paint(painter2, timeRange)
    }
}

const onPropsChange = (layer: Layer, layerProps: TimeWidgetLayerProps) => {
}

export const createMainLayer = () => {
    return new CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>(onPaint, onPropsChange)
}