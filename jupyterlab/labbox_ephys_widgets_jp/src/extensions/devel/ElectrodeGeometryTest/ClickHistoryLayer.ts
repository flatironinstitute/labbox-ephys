import { CanvasPainter } from '../../CanvasWidget/CanvasPainter'
import { CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler } from '../../CanvasWidget/CanvasWidgetLayer'
import { Vec2 } from '../../CanvasWidget/Geometry'
import { ElectrodeLayerProps } from './ElectrodeGeometry'

export type ClickHistoryState = {clickHistory: Vec2[]}
export const paintClickLayer = (painter: CanvasPainter, props: ElectrodeLayerProps, state: ClickHistoryState) => {
    painter.wipe()
    state?.clickHistory?.forEach((point, i) => {
        const color = i * 50
        const pen = {color: `rgb(${color}, 0, 128)`, width: 3}
        const boundingRect = {
            xmin: point[0] - 5,
            ymin: point[1] - 5,
            xmax: point[0] + 5,
            ymax: point[1] + 5
        }
        painter.drawEllipse(boundingRect, pen)
    })
}

export const handleClickTrail: DiscreteMouseEventHandler = (e: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps, ClickHistoryState>) => {
    if (e.type !== ClickEventType.Press) return
    let clickLayerState = layer.getState()
    const clickHistory = clickLayerState?.clickHistory || []
    layer.setState({
        clickHistory: [e.point, ...clickHistory.slice(0,9)]
    })
    layer.scheduleRepaint()
}
