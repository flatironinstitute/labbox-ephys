import { CanvasPainter } from "../jscommon/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragEvent, DragHandler } from "../jscommon/CanvasWidget/CanvasWidgetLayer"
import { Point2D, TimeWidgetLayerProps } from "./TimeWidgetLayerProps"
import { linearInverse, transformPainter } from "./transformPainter"

type Layer = CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>

interface LayerState {
    transformations: ((p: Point2D) => Point2D)[]
    inverseTransformations: ((p: Point2D) => Point2D)[]
    anchorTimepoint: number | null
    dragging: boolean
}

const onPaint = (painter: CanvasPainter, layerProps: TimeWidgetLayerProps, state: LayerState) => {
    const { panels, timeRange, width, height, margins } = layerProps
    if (!timeRange) return
    if (panels.length === 0) return

    const {transformations} = state

    painter.wipe()
    for (let i = 0; i < panels.length; i++) {
        const painter2 = transformPainter(painter, transformations[i])
        panels[i].setTimeRange(timeRange)
        panels[i].paint(painter2)
    }
}

const onPropsChange = (layer: Layer, layerProps: TimeWidgetLayerProps) => {
    const { panels } = layerProps
    panels.forEach((panel) => {
        panel.register(() => {
            layer.scheduleRepaint()
        })
    })

    const { timeRange, width, height, margins } = layerProps
    if (!timeRange) return

    const transformations = panels.map((panel, i) => {
        return (p: Point2D): Point2D => {
            const xfrac = (p.x - timeRange.min) / (timeRange.max - timeRange.min)
            const yfrac = (i / panels.length) + p.y * (1 / panels.length)
            const x = margins.left + xfrac * (width - margins.left - margins.right)
            const y = height - margins.bottom - yfrac * (height - margins.bottom - margins.top)
            return {x, y}
        }
    })
    const inverseTransformations = transformations.map(transformation => (linearInverse(transformation)))
    layer.setState({
        ...layer.getState(),
        transformations,
        inverseTransformations
    })
}

export const handleClick: DiscreteMouseEventHandler = (e: ClickEvent, layer: CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>) => {
    if (e.type === ClickEventType.Move) return
    
    const props = layer.getProps()
    if (!props) return
    const { inverseTransformations, dragging } = layer.getState()

    for (let i = 0; i< inverseTransformations.length; i++) {
        const p = inverseTransformations[i]({x: e.point[0], y: e.point[1]})
        if ((0 <= p.y) && (p.y <= 1)) {
            if (e.type === ClickEventType.Press) {
                layer.setState({...layer.getState(), anchorTimepoint: p.x, dragging: false})
            }
            else if (e.type === ClickEventType.Release) {
                if (!dragging) {
                    props.onClick && props.onClick({timepoint: p.x, panelIndex: i, y: p.y})
                }
            }
            return
        }
    }
}

export const handleDrag: DragHandler = (layer: CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>, drag: DragEvent) => {
    const props = layer.getProps()
    if (!props) return
    const {anchorTimepoint, transformations, inverseTransformations} = layer.getState()
    if (anchorTimepoint === null) return
    const pos = drag.position
    if (!pos) return
    if (inverseTransformations.length === 0) return
    layer.setState({...layer.getState(), dragging: true})
    const t = inverseTransformations[0]({x: pos[0], y: pos[1]}).x
    // now we want
    props.onDrag && props.onDrag({anchorTimepoint, newTimepoint: t})
}


export const createMainLayer = () => {
    return new CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>(
        onPaint,
        onPropsChange,
        {  
            discreteMouseEventHandlers: [handleClick],
            dragHandlers: [handleDrag]
        }
    )
}