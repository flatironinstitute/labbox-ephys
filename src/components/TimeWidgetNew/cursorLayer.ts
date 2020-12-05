import { CanvasPainter, Pen } from "../../CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer } from "../../CanvasWidget/CanvasWidgetLayer"
import { Vec2 } from "../../CanvasWidget/Geometry"
import { funcToTransform } from "./mainLayer"
import { TimeWidgetLayerProps } from "./TimeWidgetLayerProps"

type Layer = CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>

interface LayerState {

}

const initialLayerState = {}

const onPaint = (painter: CanvasPainter, layerProps: TimeWidgetLayerProps, state: LayerState) => {
    const { currentTime, timeRange, samplerate, width, height, margins } = layerProps
    if (!timeRange) return

    painter.wipe()

    if (currentTime === null) return

    if (currentTime < timeRange.min) return
    if (currentTime > timeRange.max) return

    const pen: Pen = {color: 'blue', width: 2}

    const transformation = funcToTransform((p: Vec2): Vec2 => {
        const xfrac = (p[0] - timeRange.min) / (timeRange.max - timeRange.min)
        const yfrac = p[1]
        const x = margins.left + xfrac * (width - margins.left - margins.right)
        const y = height - margins.bottom - yfrac * (height - margins.bottom - margins.top)
        return [x, y]
    })

    const painter2 = painter.transform(transformation)

    painter2.drawLine(currentTime, 0, currentTime, 1, pen)
}

const onPropsChange = (layer: Layer, layerProps: TimeWidgetLayerProps) => {
}

export const createCursorLayer = () => {
    return new CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>(onPaint, onPropsChange, initialLayerState)
}