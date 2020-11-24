import { CanvasPainter } from "../jscommon/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragEvent, DragHandler } from "../jscommon/CanvasWidget/CanvasWidgetLayer"
import { getInverseTransformationMatrix, TransformationMatrix, transformPoint, Vec2 } from "../jscommon/CanvasWidget/Geometry"
import { TimeWidgetLayerProps } from "./TimeWidgetLayerProps"

type Layer = CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>

interface LayerState {
    timeRange: {min: number, max: number}
    transformations: TransformationMatrix[]
    inverseTransformations: TransformationMatrix[]
    anchorTimepoint: number | null
    dragging: boolean
    paintStatus: {
        painting: boolean,
        nextPaint: (() => void) | null
    }
}

const onPaint = (painter: CanvasPainter, layerProps: TimeWidgetLayerProps, state: LayerState) => {
    const { panels, timeRange, width, height, margins } = layerProps
    if (!timeRange) return
    if (panels.length === 0) return

    painter.wipe()
    for (let i = 0; i < panels.length; i++) {
        const painter2 = painter.transform(state.transformations[i])
        panels[i].setTimeRange(timeRange)
        panels[i].paint(painter2)
    }

    // const thisTimestamp = Number(new Date())

    // const doPaint = () => {
    //     painter.wipe()
    //     for (let i = 0; i < panels.length; i++) {
    //         const painter2 = painter.transform(state.transformations[i])
    //         panels[i].setTimeRange(timeRange)
    //         panels[i].paint(painter2)
    //     }
    // }

    // const tryNextPaint = () => {
    //     if (state.paintStatus.nextPaint) {
    //         state.paintStatus.nextPaint()
    //         setTimeout(() => {
    //             tryNextPaint()
    //         }, 2)
    //     }
    //     else {
    //         state.paintStatus.painting = false
    //     }
    // }

    // if (!state.paintStatus.painting) {
    //     state.paintStatus.nextPaint = null
    //     state.paintStatus.painting = true
    //     doPaint()
    //     setTimeout(() => {
    //         tryNextPaint()
    //     }, 2)
    // }
    // else {
    //     state.paintStatus.nextPaint = doPaint
    // }
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
        timeRange,
        transformations,
        inverseTransformations,
        paintStatus: layer.getState().paintStatus || {
            painting: false,
            timestamp: Number(new Date()),
            pendingTimestamp: Number(new Date()),
            lastPaintFinishedTimestamp: Number(new Date())
        }
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

const shiftTimeRange = (timeRange: {min: number, max: number}, shift: number): {min: number, max: number} => {
    return {
        min: Math.floor(timeRange.min + shift),
        max: Math.floor(timeRange.max + shift)
    }
}

export const handleDrag: DragHandler = (layer: CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>, drag: DragEvent) => {
    const props = layer.getProps()
    if (!props) return
    const {anchorTimepoint, inverseTransformations, timeRange} = layer.getState()
    if (anchorTimepoint === null) return
    const pos = drag.position
    if (!pos) return
    if (inverseTransformations.length === 0) return
    layer.setState({...layer.getState(), dragging: true})
    const t = transformPoint(inverseTransformations[0], pos)[0]
    const newTimeRange = shiftTimeRange(timeRange, anchorTimepoint - t)
    // now we want
    props.onDrag && props.onDrag({newTimeRange})
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