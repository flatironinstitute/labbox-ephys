import { CanvasPainter } from "../jscommon/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragEvent, DragHandler } from "../jscommon/CanvasWidget/CanvasWidgetLayer"
import { getInverseTransformationMatrix, TransformationMatrix, transformPoint, Vec2 } from "../jscommon/CanvasWidget/Geometry"
import { TimeWidgetLayerProps } from "./TimeWidgetLayerProps"

type Layer = CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>

interface LayerState {
    transformations: TransformationMatrix[]
    inverseTransformations: TransformationMatrix[]
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
        const painter2 = painter.transform(transformations[i])
        panels[i].setTimeRange(timeRange)
        panels[i].paint(painter2)
    }
}

export const funcToTransform = (transformation: (p: Vec2) => Vec2): TransformationMatrix => {
    const p00 = transformation([0, 0])
    const p10 = transformation([1, 0])
    const p01 = transformation([0, 1])

    const M: TransformationMatrix = [
        [p10[0] - p00[0], p01[0] - p00[0], p00[0]],
        [p10[1] - p00[1], p01[1] - p00[1], p00[1]],
        [0, 0, 1]
    ]
    return M
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
        return funcToTransform((p: Vec2): Vec2 => {
            const xfrac = (p[0] - timeRange.min) / (timeRange.max - timeRange.min)
            const yfrac = (i / panels.length) + p[1] * (1 / panels.length)
            const x = margins.left + xfrac * (width - margins.left - margins.right)
            const y = height - margins.bottom - yfrac * (height - margins.bottom - margins.top)
            return [x, y]
        })
    })
    const inverseTransformations = transformations.map(T => (getInverseTransformationMatrix(T)))
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
        const p = transformPoint(inverseTransformations[i], e.point)
        if ((0 <= p[1]) && (p[1] <= 1)) {
            if (e.type === ClickEventType.Press) {
                layer.setState({...layer.getState(), anchorTimepoint: p[0], dragging: false})
            }
            else if (e.type === ClickEventType.Release) {
                if (!dragging) {
                    props.onClick && props.onClick({timepoint: p[0], panelIndex: i, y: p[1]})
                }
            }
            return
        }
    }
}

export const handleDrag: DragHandler = (layer: CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>, drag: DragEvent) => {
    const props = layer.getProps()
    if (!props) return
    const {anchorTimepoint, inverseTransformations} = layer.getState()
    if (anchorTimepoint === null) return
    const pos = drag.position
    if (!pos) return
    if (inverseTransformations.length === 0) return
    layer.setState({...layer.getState(), dragging: true})
    const t = transformPoint(inverseTransformations[0], pos)[0]
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