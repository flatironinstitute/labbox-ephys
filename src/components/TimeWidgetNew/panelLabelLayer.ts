import { CanvasPainter, Font, TextAlignment } from "../jscommon/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer } from "../jscommon/CanvasWidget/CanvasWidgetLayer"
import { RectangularRegion } from "../jscommon/CanvasWidget/Geometry"
import { Point2D, TimeWidgetLayerProps } from "./TimeWidgetLayerProps"
import { transformPainter } from "./transformPainter"

type Layer = CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>

interface LayerState {

}

const onPaint = (painter: CanvasPainter, layerProps: TimeWidgetLayerProps, state: LayerState) => {
    const { panels, width, height, margins } = layerProps
    if (panels.length === 0) return

    painter.wipe()
    for (let i = 0; i < panels.length; i++) {
        const transformation = (p: Point2D): Point2D => {
            const xfrac = p.x
            const yfrac = (i / panels.length) + p.y * (1 / panels.length)
            const x = 0 + xfrac * margins.left
            const y = height - margins.bottom - yfrac * (height - margins.bottom - margins.top)
            return {x, y}
        }
        const painter2 = transformPainter(painter, transformation)
        const label: string = panels[i].label()
        let rect: RectangularRegion = {xmin: 0.2, ymin: 0.2, xmax: 0.6, ymax: 0.6}
        let alignment: TextAlignment = {Horizontal: 'AlignRight', Vertical: "AlignCenter"}
        const font: Font = {'pixel-size': 12, family: 'Arial'}
        painter2.drawText(rect, alignment, font, {color: 'black'}, {color: 'black'}, label)
    }
}

const onPropsChange = (layer: Layer, layerProps: TimeWidgetLayerProps) => {
}

export const createPanelLabelLayer = () => {
    return new CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>(onPaint, onPropsChange)
}