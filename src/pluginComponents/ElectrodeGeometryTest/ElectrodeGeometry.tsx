import { norm } from 'mathjs';
import React, { useCallback, useRef } from 'react';
import { CanvasPainter, Pen } from '../../components/jscommon/CanvasWidget/CanvasPainter';
import { CanvasWidgetLayer, ClickEvent, DiscreteMouseEventHandler, DragHandler, DrawingSpaceProps } from '../../components/jscommon/CanvasWidget/CanvasWidgetLayer';
import CanvasWidget from '../../components/jscommon/CanvasWidget/CanvasWidgetNew';
import { getBasePixelTransformationMatrix, getHeight, getInverseTransformationMatrix, getWidth, RectangularRegion, Vec2, Vec4 } from '../../components/jscommon/CanvasWidget/Geometry';

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
    // keep it square -- TODO: Should actually worry about the aspect ratio of the underlying canvas?
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


interface ClickLayerProps extends ElectrodeLayerProps {
    clickHistory: Vec2[]
}
const paintClickLayer = (painter: CanvasPainter, props: ClickLayerProps) => {
    console.log('PaintClickLayer')
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

// TODO: This doesn't currently work :(
interface AnimatedLayerProps extends ElectrodeLayerProps {
    point: Vec2 | undefined,
    requestRepaint: () => void,
    start: DOMHighResTimeStamp | undefined
}
const animateClickLayer = (painter: CanvasPainter, props: AnimatedLayerProps, timestamp?: DOMHighResTimeStamp) => {
    console.log('AnimateClickLayer')

    const firstFrame = (timestamp: DOMHighResTimeStamp) => {
        return animateClickLayer(painter, {...props, start: timestamp}, timestamp)
    }

    const stepFrame = (timestamp: DOMHighResTimeStamp) => {
        return animateClickLayer(painter, props, timestamp)
    }

    if (!props.point) return
    if (!props.start) {
        window.requestAnimationFrame(firstFrame)
        return
    }
    if (!timestamp) { // this may be unreachable
        window.requestAnimationFrame(stepFrame)
        return
    }


    console.log('Animating next frame')
    const duration = 250  // animation runs for a quarter-second
    const end = props.start + duration
    const pct = (Math.min(end, timestamp) - props.start) / duration
    const maxRadius = 20
    const currentRadius = Math.floor(maxRadius * pct)
    const color = Math.floor(255 * pct)
    const done = timestamp > end

    painter.wipe()
    if (!done) {
        const pen = {color: `rgb(128, 0, ${color})`, width: 3}
        const boundingBox = {
            xmin: props.point[0] - currentRadius,
            ymin: props.point[1] - currentRadius,
            xmax: props.point[0] + currentRadius,
            ymax: props.point[1] + currentRadius
        }
        painter.drawEllipse(boundingBox, pen)
    }
    props.requestRepaint()
    if (!done) window.requestAnimationFrame(stepFrame)
}


const ElectrodeGeometry = (props: ElectrodeGeometryProps) => {
    const width = 200
    const height = 200
    const { electrodes } = props
    const { scaledCoordinates, electrodeRect } = computeElectrodeCoordinates(electrodes)
    const radius = computeRadius(electrodes, scaledCoordinates, electrodeRect)
    const {matrix} = getBasePixelTransformationMatrix(width, height, scaledCoordinates)
    const inverse = getInverseTransformationMatrix(matrix)
    const augmentedProps = {
        ...props,
        width: width,
        height: height,
        Transform: { coordinateRange: scaledCoordinates, transformationMatrix: matrix, inverseMatrix: inverse },
        scaledCoordinates: scaledCoordinates,
        electrodeRect: electrodeRect,
        electrodeRadius: radius,
    }

    const testLayer = useRef(new CanvasWidgetLayer<ElectrodeLayerProps>(paintTestLayer, augmentedProps,
        {
            discreteMouseEventHandlers: [], //[reportMouseMove, reportMouseClick], // this gets real chatty
            dragHandlers: []//[reportMouseDrag]
        })).current
    const clickLayer = useRef(new CanvasWidgetLayer<ClickLayerProps>(paintClickLayer, 
        {...augmentedProps, clickHistory: []},
        {
            discreteMouseEventHandlers: [handleClickTrail],
            dragHandlers: []
        }
        )).current

    // this is still all kinds of messed up
    const animatedLayer = useRef(new CanvasWidgetLayer<AnimatedLayerProps>(animateClickLayer, {...augmentedProps, point: undefined, requestRepaint: () => (''), start: undefined })).current
    // note self-referentiality here. animatedLayer needs an ability to request its canvas schedule a repaint during its animation cycle.
    animatedLayer.setProps({...animatedLayer.getProps(), requestRepaint: animatedLayer.scheduleRepaint})
    const layers = [testLayer, clickLayer ]//, animatedLayer]


    const _handleMousePress = useCallback((pos: Vec2) => {
        const clickLayerProps = clickLayer.getProps()
        // clickLayer.setProps({
        //     ...clickLayer.getProps(),
        //     clickHistory: [pos, ...clickLayerProps.clickHistory.slice(0, 9)]
        // })
        // clickLayer.scheduleRepaint()

        animatedLayer.setProps({...animatedLayer.getProps(), point: pos})
        console.log('--- on mouse press', pos)
    }, [clickLayer, animatedLayer])
    const _handleMouseRelease = useCallback((pos: Vec2) => {
        console.log('--- on mouse release', pos)
    }, [])
    const _handleMouseDrag = useCallback((args: {anchor?: Vec2, pos?: Vec2, rect?: Vec4}) => {
        args.rect && console.log('--- on mouse drag [upper left corner x, y; width, height]', args.rect)
    }, [])
    const _handleMouseDragRelease = useCallback((args: {anchor?: Vec2, pos?: Vec2, rect?: Vec4}) => {
        console.log('--- on mouse drag release', args.rect)
    }, [])
    return (
        <CanvasWidget
            key='canvas'
            layers={layers}
            width={width}
            height={height}
            onMousePress={_handleMousePress}
            onMouseRelease={_handleMouseRelease}
            onMouseDrag={_handleMouseDrag}
            onMouseDragRelease={_handleMouseDragRelease}
        />
    )
}

export default ElectrodeGeometry