import { norm } from 'mathjs';
import React, { useRef } from 'react';
import { Brush, CanvasPainter, Pen } from '../../components/jscommon/CanvasWidget/CanvasPainter';
import { CanvasWidgetLayer, ClickEvent, DiscreteMouseEventHandler, DragHandler, DrawingSpaceProps } from '../../components/jscommon/CanvasWidget/CanvasWidgetLayer';
import CanvasWidget from '../../components/jscommon/CanvasWidget/CanvasWidgetNew';
import { getBasePixelTransformationMatrix, getHeight, getInverseTransformationMatrix, getWidth, RectangularRegion, rectangularRegionsIntersect, Vec2 } from '../../components/jscommon/CanvasWidget/Geometry';

type Electrode = {
    label: string,
    x: number,
    y: number
}

interface ElectrodeGeometryProps {
    electrodes: Electrode[]
}

interface ElectrodeLayerProps extends ElectrodeGeometryProps {
    width: number
    height: number
    Transform: DrawingSpaceProps
    electrodeRect: RectangularRegion
    scaledCoordinates: RectangularRegion
    electrodeRadius: number
}

const computeElectrodeCoordinates = (electrodes: Electrode[]): {scaledCoordinates: RectangularRegion, electrodeRect: RectangularRegion} => {
    // we don't actually know the number or locations of the electrodes.
    // Read the data to figure out an appropriate scale.
    const electrodeXs = electrodes.map((point) => point.x)
    const electrodeYs = electrodes.map((point) => point.y)
    
    const electrodeRect = {
        xmin: Math.min(...electrodeXs),
        xmax: Math.max(...electrodeXs),
        ymin: Math.min(...electrodeYs),
        ymax: Math.max(...electrodeYs)
    }

    // Assuming we want to keep the origin in the range, while the min point is not at (0,0), a perfect
    // fit to min((0,0), lowest-left point) and maxes will give more bottom-left margin than top or right margin.
    // To compensate, xmax and ymax need to include padding from their maxes up to the difference b/w min and 0.
    const extraXoffsetFrom0 = Math.max(electrodeRect.xmin, 0)
    const extraYoffsetFrom0 = Math.max(electrodeRect.ymin, 0)

    const electrodeRanges = {
        xmin: Math.min(electrodeRect.xmin, 0),
        ymin: Math.min(electrodeRect.ymin, 0),
        xmax: Math.max(electrodeRect.xmax, electrodeRect.xmax + extraXoffsetFrom0),
        ymax: Math.max(electrodeRect.ymax, electrodeRect.ymax + extraYoffsetFrom0)
    }
    // keep it square -- TODO: Should we actually worry about the aspect ratio of the underlying canvas?
    const side = Math.max(getWidth(electrodeRanges), getHeight(electrodeRanges))
    // add a margin
    const margin = side * .05
    const scaledCoordinates = {
        xmin: electrodeRanges.xmin - margin,
        xmax: electrodeRanges.xmin + side + margin,
        ymin: electrodeRanges.ymin - margin,
        ymax: electrodeRanges.ymin + side + margin
    }

    // console.log(`Ranges: ${JSON.stringify(scaledCoordinates)} from ${JSON.stringify(electrodeRanges)}`)
    return {scaledCoordinates: scaledCoordinates, electrodeRect: electrodeRect}
}

const computeRadius = (electrodes: Electrode[], scaledCoordinates: RectangularRegion, electrodeRect: RectangularRegion): number => {
    // how big should each electrode dot be? Really depends on how close
    // the dots are to each other. Let's find the closest pair of dots and
    // set the radius to 40% of the distance between them.
    let leastNorm = Math.min(electrodeRect.xmin - scaledCoordinates.xmin, electrodeRect.ymin - scaledCoordinates.ymin,
                             scaledCoordinates.xmax - electrodeRect.xmax, scaledCoordinates.ymax - electrodeRect.ymax)
    electrodes.forEach((point) => {
        electrodes.forEach((otherPoint) => {
            const dist = norm([point.x - otherPoint.x, point.y - otherPoint.y])
            if (dist === 0) return
            leastNorm = Math.min(leastNorm, dist as number)
        })
    })
    const radius = 0.4 * leastNorm
    // console.log(`LeastNorm: ${leastNorm}`)
    return radius
}

const getBoundingRect = (e: Electrode, r: number, fill: boolean = false): RectangularRegion => {
    const myRadius = fill ? r - 1 : r
    return {
        xmin: e.x - myRadius,
        ymin: e.y - myRadius,
        xmax: e.x + myRadius,
        ymax: e.y + myRadius
    }
}

const paintTestLayer = (painter: CanvasPainter, props: ElectrodeLayerProps) => {
    painter.wipe()
    const pen: Pen = {color: 'rgb(22, 22, 22)', width: 3}

    props.electrodes.forEach(electrode => {
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

const reportMouseMove: DiscreteMouseEventHandler = (e: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps>) => {
    if (e.type !== 'Move') return
    console.log(`Mouse moved to relcoords at ${JSON.stringify(e.point)}`)
}

const reportMouseClick: DiscreteMouseEventHandler = (e: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps>) => {
    if (e.type !== 'Press' && e.type !== 'Release') return
    console.log(`Mouse ${e.type === 'Press' ? 'down' : 'up'} at ${JSON.stringify(e.point)}`)
}

const reportMouseDrag: DragHandler = ( layer: CanvasWidgetLayer<any>, dragRect: RectangularRegion, released: boolean, anchor?: Vec2, position?: Vec2) => {
    console.log(`Drag state: ${released ? 'final' : 'ongoing'}`)
    console.log(`Rect: ${JSON.stringify(dragRect)} anchor: ${anchor} point: ${position}`)
}

interface DragLayerProps extends ElectrodeLayerProps {
    dragRegion: RectangularRegion | null
    selectedElectrodes: Electrode[]
    draggedElectrodes: Electrode[]
}
const paintDragLayer = (painter: CanvasPainter, props: DragLayerProps) => {
    painter.wipe()
    if (!props.dragRegion && props.selectedElectrodes.length === 0 && props.draggedElectrodes.length === 0) return;
    const regionBrush: Brush = {color: 'rgba(127, 127, 127, 0.5)'}
    const selectedElectrodeBrush: Brush = {color: 'rgb(0, 0, 192)'}
    const draggedElectrodeBrush: Brush = {color: 'rgb(192, 192, 255)'}

    props.selectedElectrodes.forEach(e => {
        painter.fillEllipse(getBoundingRect(e, props.electrodeRadius, true), selectedElectrodeBrush)
    })
    props.draggedElectrodes.forEach(e => {
        painter.fillEllipse(getBoundingRect(e, props.electrodeRadius, true), draggedElectrodeBrush)
    })
    props.dragRegion && painter.fillRect(props.dragRegion, regionBrush)
}
const updateDragRegion: DragHandler = (layer: CanvasWidgetLayer<any>, dragRect: RectangularRegion, released: boolean, anchor?: Vec2, position?: Vec2) => {
    const { electrodes, electrodeRadius } = layer.getProps()
    const rects = electrodes.map((e: Electrode) => {return {...e, br: getBoundingRect(e, electrodeRadius)}})
    const hits = rects.filter((r: any) => rectangularRegionsIntersect(r.br, dragRect))
    if (released) {
        layer.setProps({...layer.getProps(), dragRegion: null, draggedElectrodes: [], selectedElectrodes: hits})
    } else {
        layer.setProps({...layer.getProps(), dragRegion: dragRect, draggedElectrodes: hits})
    }
    layer.scheduleRepaint()
}

interface ClickLayerProps extends ElectrodeLayerProps {
    clickHistory: Vec2[]
}
const paintClickLayer = (painter: CanvasPainter, props: ClickLayerProps) => {
    painter.wipe()
    props.clickHistory.forEach((point, i) => {
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

const handleClickTrail: DiscreteMouseEventHandler = (e: ClickEvent, layer: CanvasWidgetLayer<ClickLayerProps>) => {
    if (e.type !== 'Press') return
    const clickLayerProps = layer.getProps()
    layer.setProps({
        ...clickLayerProps,
        clickHistory: [e.point, ...clickLayerProps.clickHistory.slice(0,9)]
    })
    layer.scheduleRepaint()
}

interface AnimationPoint {
    loc: Vec2
    start: DOMHighResTimeStamp
    end: DOMHighResTimeStamp
    pct: number
    done: boolean
}
interface AnimatedLayerProps extends ElectrodeLayerProps {
    points: AnimationPoint[],
    newQueue: AnimationPoint[]
}
const paintAnimationLayer = (painter: CanvasPainter, props: AnimatedLayerProps) => {
    painter.wipe() // avoids afterimages. Placing before the short-circuit return also cleans up when done.
    if (props.points.length === 0) return

    for (let pt of props.points) {
        const maxRadius = 20 // proof-of-concept; in practice this might be attached to the data entry
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
const animate = (layer: CanvasWidgetLayer<AnimatedLayerProps>, timeStamp: DOMHighResTimeStamp) => {
    const nextFrame = (stamp: DOMHighResTimeStamp) => {
        return animate(layer, stamp)
    }
    // update data for the points
    const candidatePts = layer.getProps().points
    while (layer.getProps().newQueue.length > 0) {
        const pt = layer.getProps().newQueue.shift()
        pt && candidatePts.push(pt)
    }
    const pts = candidatePts.filter((pt) => !pt.done)
    for (let pt of pts) {
        pt.pct = (Math.min(pt.end, timeStamp) - pt.start) / (pt.end - pt.start)
        pt.done = pt.pct === 1
    }
    layer.setProps({...layer.getProps(), points: pts})
    layer.scheduleRepaint()
    if(layer.getProps().points.length > 0) {
        window.requestAnimationFrame(nextFrame)
    }
}
const handleAnimatedClick: DiscreteMouseEventHandler = (e: ClickEvent, layer: CanvasWidgetLayer<AnimatedLayerProps>) => {
    if (e.type !== 'Press') return
    const now = performance.now()
    const duration = 250 //quarter-second
    const newPoint = {
        loc: e.point,
        start: now,
        end: now + duration,
        pct: 0,
        done: false
    }
    const pts = layer.getProps().newQueue
    pts.push(newPoint)
    layer.setProps({...layer.getProps(), newQueue: pts})
    animate(layer, now)
}


const ElectrodeGeometry = (props: ElectrodeGeometryProps) => {
    const width = 200
    const height = 200
    const { electrodes } = props
    const { scaledCoordinates, electrodeRect } = computeElectrodeCoordinates(electrodes)
    const radius = computeRadius(electrodes, scaledCoordinates, electrodeRect)
    const {matrix} = getBasePixelTransformationMatrix(width, height, scaledCoordinates)
    const augmentedProps = {
        ...props,
        width: width,
        height: height,
        Transform: { coordinateRange: scaledCoordinates, transformationMatrix: matrix, inverseMatrix: getInverseTransformationMatrix(matrix) },
        scaledCoordinates: scaledCoordinates,
        electrodeRect: electrodeRect,
        electrodeRadius: radius,
    }

    const testLayer = useRef(new CanvasWidgetLayer<ElectrodeLayerProps>(paintTestLayer, augmentedProps,
        {
            discreteMouseEventHandlers: [], //[reportMouseMove, reportMouseClick], // this gets REAL chatty
            dragHandlers: []//reportMouseDrag]
        })).current
    const dragLayer = useRef(new CanvasWidgetLayer<DragLayerProps>(paintDragLayer,
        {...augmentedProps, dragRegion: null, selectedElectrodes: [], draggedElectrodes: []},
        {
            discreteMouseEventHandlers: [],
            dragHandlers: [updateDragRegion]
        })).current
    const clickLayer = useRef(new CanvasWidgetLayer<ClickLayerProps>(paintClickLayer, 
        {...augmentedProps, clickHistory: []},
        {
            discreteMouseEventHandlers: [handleClickTrail],
            dragHandlers: []
        })).current
    const animatedLayer = useRef(new CanvasWidgetLayer<AnimatedLayerProps>(paintAnimationLayer,
        {...augmentedProps, points: [], newQueue: [] },
        {  
            discreteMouseEventHandlers: [handleAnimatedClick],
            dragHandlers: []
        })).current
    const layers = [testLayer, dragLayer, clickLayer, animatedLayer]

    return (
        <CanvasWidget
            key='canvas'
            layers={layers}
            width={width}
            height={height}
        />
    )
}

export default ElectrodeGeometry