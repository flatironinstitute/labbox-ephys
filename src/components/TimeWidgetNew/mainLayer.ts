import { sleepMsec } from "../../hither/createHitherJob"
import { CanvasPainter } from "../jscommon/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragEvent, DragHandler, KeyboardEvent, KeyboardEventHandler, WheelEvent, WheelEventHandler } from "../jscommon/CanvasWidget/CanvasWidgetLayer"
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
        paintCode: number,
        completenessFactor: number
    }
}

const onPaint = async (painter: CanvasPainter, layerProps: TimeWidgetLayerProps, state: LayerState): Promise<void> => {
    const { panels, timeRange } = layerProps
    if (!timeRange) return
    if (panels.length === 0) return
    state.paintStatus.paintCode ++
    const paintCode = state.paintStatus.paintCode

    for (let level = 1 ; level <= 2; level++) {
        let completenessFactor = state.paintStatus.completenessFactor
        painter.useOffscreenCanvas(layerProps.width, layerProps.height)
        if (level === 1) {
            painter.wipe()
        }
        else if (level === 2) {
            completenessFactor = 1
        }
        const timer = Number(new Date())
        for (let i = 0; i < panels.length; i++) {
            const painter2 = painter.transform(state.transformations[i])
            panels[i].setTimeRange(timeRange)
            panels[i].paint(painter2, completenessFactor)
            if (level === 2) {
                await sleepMsec(0)
                if (paintCode !== state.paintStatus.paintCode) {
                    return
                }
            }
        }
        const elapsed = Number(new Date()) - timer
        if ((level === 1) && (elapsed)) {
            layerProps.onRepaintTimeEstimate(elapsed)
            // let's adjust the completeness factor based on a target elapsed time
            const targetElapsed = 40
            state.paintStatus.completenessFactor = state.paintStatus.completenessFactor * targetElapsed / elapsed
            state.paintStatus.completenessFactor = Math.min(1, Math.max(0.15, state.paintStatus.completenessFactor))
        }
        painter.transferOffscreenToPrimary()
        if (completenessFactor === 1) break
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
            paintCode: 0,
            completenessFactor: 0.2
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

export const handleWheel: WheelEventHandler = (e: WheelEvent, layer: CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>) => {
    const props = layer.getProps()
    if (!props) return
    if (e.deltaY > 0) {
        props.onTimeZoom && props.onTimeZoom(1 / 1.15)
    }
    else if (e.deltaY < 0) {
        props.onTimeZoom && props.onTimeZoom(1.15)
    }
}

export const handleKeyboardEvent: KeyboardEventHandler = (e: KeyboardEvent, layer: CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>): boolean => {
    const props = layer.getProps()
    if (!props) return true
    for (let a of props.customActions || []) {
        if (a.type === 'button') {
            if (a.keyCode === e.keyCode) {
                a.callback()
                return false
            }
        }
    }
    switch (e.keyCode) {
        case 37: props.onTimeShiftFrac && props.onTimeShiftFrac(-0.2); return false;
        case 39: props.onTimeShiftFrac && props.onTimeShiftFrac(+0.2); return false;
        case 187: props.onTimeZoom && props.onTimeZoom(1.15); return false;
        case 189: props.onTimeZoom && props.onTimeZoom(1 / 1.15); return false;
        case 35: props.onGotoEnd && props.onGotoEnd(); return false;
        case 36: props.onGotoHome && props.onGotoHome(); return false;
        default: console.info('key: ' + e.keyCode); return true;
    }
}

export const createMainLayer = () => {
    return new CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>(
        onPaint,
        onPropsChange,
        {  
            discreteMouseEventHandlers: [handleClick],
            dragHandlers: [handleDrag],
            wheelEventHandlers: [handleWheel],
            keyboardEventHandlers: [handleKeyboardEvent]
        }
    )
}