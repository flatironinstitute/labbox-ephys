import { CanvasPainter, Pen } from '../../components/jscommon/CanvasWidget/CanvasPainter'
import { CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragHandler } from '../../components/jscommon/CanvasWidget/CanvasWidgetLayer'
import { RectangularRegion, Vec2 } from '../../components/jscommon/CanvasWidget/Geometry'
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
( layer: CanvasWidgetLayer<ElectrodeLayerProps, any>, dragRect: RectangularRegion, released: boolean, anchor?: Vec2, position?: Vec2) => {
    console.log(`Drag state: ${released ? 'final' : 'ongoing'}`)
    console.log(`Rect: ${JSON.stringify(dragRect)} anchor: ${anchor} point: ${position}`)
}
