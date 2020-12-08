import { CanvasPainter } from '../../CanvasWidget/CanvasPainter'
import { CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler } from '../../CanvasWidget/CanvasWidgetLayer'
import { Vec2 } from '../../CanvasWidget/Geometry'
import { ElectrodeLayerProps } from './ElectrodeGeometry'

interface AnimationPoint {
    loc: Vec2
    start: DOMHighResTimeStamp
    end: DOMHighResTimeStamp
    pct: number
    done: boolean
}
export interface AnimatedLayerState {
    points: AnimationPoint[],
    newQueue: AnimationPoint[]
}
export const paintAnimationLayer = (painter: CanvasPainter, props: ElectrodeLayerProps, state: AnimatedLayerState) => {
    painter.wipe() // avoids afterimages. Placing before the short-circuit return also cleans up when done.
    if (!(state?.points) || state.points.length === 0) return

    for (let pt of state.points) {
        const maxRadius = 20 // proof-of-concept; in practice this might be attached to the data record
        const currentRadius = Math.floor(maxRadius * pt.pct)
        const blueLevel = Math.floor(255 * pt.pct)
        const redLevel = Math.floor(255 - (255*pt.pct))
        // const pen = { color: `rgb(${redLevel}, 0, ${blueLevel})`, width: 2}
        const brush = { color: `rgb(${redLevel}, 0, ${blueLevel})`}
        const boundingBox = {
            xmin: pt.loc[0] - currentRadius,
            ymin: pt.loc[1] - currentRadius,
            xmax: pt.loc[0] + currentRadius,
            ymax: pt.loc[1] + currentRadius
        }
        painter.fillEllipse(boundingBox, brush)
    }
}

// NOTE: Possible race condition in adding new points.
// If this were actually something important, we'd want to use a safer multiprocessing model for it.
const animate = (layer: CanvasWidgetLayer<ElectrodeLayerProps, AnimatedLayerState>, timeStamp: DOMHighResTimeStamp) => {
    const nextFrame = (stamp: DOMHighResTimeStamp) => {
        return animate(layer, stamp)
    }
    const state = layer.getState()
    // update data for the points
    const candidatePts = state?.points ?? []
    while (state?.newQueue?.length ?? -1 > 0) {
        const pt = state?.newQueue.shift()
        pt && candidatePts.push(pt)
    }
    const pts = candidatePts.filter((pt) => !pt.done)
    for (let pt of pts) {
        pt.pct = (Math.min(pt.end, timeStamp) - pt.start) / (pt.end - pt.start)
        pt.done = pt.pct === 1
    }
    const newState = layer.getState()
    layer.setState({...newState as any as AnimatedLayerState, points: pts})
    layer.scheduleRepaint()
    if(newState?.points?.length ?? -1 > 0) {
        window.requestAnimationFrame(nextFrame)
    }
}
export const handleAnimatedClick: DiscreteMouseEventHandler = (e: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps, AnimatedLayerState>) => {
    if (e.type !== ClickEventType.Press) return
    const now = performance.now()
    const duration = 250 //quarter-second
    const newPoint = {
        loc: e.point,
        start: now,
        end: now + duration,
        pct: 0,
        done: false
    }
    const state = layer.getState()
    const pts = state?.newQueue ?? []
    pts.push(newPoint)
    layer.setState({...layer.getState() as any as AnimatedLayerState, newQueue: pts})
    animate(layer, now)
}