import { CanvasPainter, Pen } from '../../common/CanvasWidget/CanvasPainter'
import { CanvasDragEvent, CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragHandler } from '../../common/CanvasWidget/CanvasWidgetLayer'
import { ElectrodeLayerProps } from './ElectrodeGeometry'

export const paintTestLayer = (painter: CanvasPainter, props: ElectrodeLayerProps) => {
    painter.wipe()
    const pen: Pen = {color: 'rgb(22, 22, 22)', width: 3}

    props.electrodes.forEach((electrode) => {
        const electrodeBoundingRect = {
            xmin: electrode.x - props.electrodeRadius,
            ymin: electrode.y - props.electrodeRadius,
            xmax: electrode.x + props.electrodeRadius,
            ymax: electrode.y + props.electrodeRadius
        }
        painter.drawEllipse(electrodeBoundingRect, pen)
        // painter.drawMarker(electrode.x, electrode.y, 20);
    })
}

export const reportMouseMove: DiscreteMouseEventHandler = (e: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps, any>) => {
    if (e.type !== ClickEventType.Move) return
    console.log(`Mouse moved to relcoords at ${JSON.stringify(e.point)}`)
}

export const reportMouseClick: DiscreteMouseEventHandler = (e: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps, any>) => {
    if (e.type !== ClickEventType.Press && e.type !== ClickEventType.Release) return
    console.log(`Mouse ${e.type === ClickEventType.Press ? 'down' : 'up'} at ${JSON.stringify(e.point)}`)
}

export const reportMouseDrag: DragHandler = 
( layer: CanvasWidgetLayer<ElectrodeLayerProps, any>, drag: CanvasDragEvent) => {
    console.log(`Drag state: ${drag.released ? 'final' : 'ongoing'} ${drag.shift ? 'additive' : 'new'}`)
    console.log(`Rect: ${JSON.stringify(drag.dragRect)} anchor: ${drag.anchor} point: ${drag.position}`)
}
