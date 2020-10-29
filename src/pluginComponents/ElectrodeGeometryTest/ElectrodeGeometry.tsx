import { norm } from 'mathjs';
import React, { useCallback, useRef } from 'react';
import { CanvasPainter, getHeight, getWidth, Pen, Vec2, Vec4 } from '../../components/jscommon/CanvasWidget/CanvasPainter';
import CanvasWidget, { CanvasWidgetLayer } from '../../components/jscommon/CanvasWidget/CanvasWidgetNew';

interface ElectrodeGeometryProps {
    electrodes: ({
        label: string,
        x: number,
        y: number
    })[]
}

const paintTestLayer = (painter: CanvasPainter, props: ElectrodeGeometryProps) => {
    console.log('PaintTestLayer')
    painter.wipe()
    painter.printCanvasDimensions()
    // we don't actually know the number or locations of the electrodes.
    // Read the data to figure out an appropriate scale
    // NOTE: To be USEFUL this stuff is going to have to exist elsewhere,
    // needs *persistence* to handle clicks properly
    const electrodeXmin = Math.min(...props.electrodes.map((point) => point.x))
    const electrodeYmin = Math.min(...props.electrodes.map((point) => point.y))

    const electrodeRanges = {
        xmin: Math.min(...props.electrodes.map((point) => point.x), 0),
        ymin: Math.min(...props.electrodes.map((point) => point.y), 0),
        xmax: Math.max(...props.electrodes.map((point) => point.x)),
        ymax: Math.max(...props.electrodes.map((point) => point.y))
    }
    // keep it square
    const side = Math.max(getWidth(electrodeRanges), getHeight(electrodeRanges))
    // add a margin
    const margin = side * .05
    const scaledCoordinates = {
        xmin: Math.min(electrodeRanges.xmin, 0) - margin,
        xmax: side + margin,
        ymin: Math.min(electrodeRanges.ymin, 0) - margin,
        ymax: side + margin
    }
    // how big should each electrode dot be? Really depends on how close
    // the dots are to each other. Let's find the closest pair of dots and
    // set the radius to 40% of the distance between them.
    let leastNorm = Math.min(electrodeXmin - scaledCoordinates.xmin, electrodeYmin - scaledCoordinates.ymin)
    props.electrodes.forEach((point) => {
        props.electrodes.forEach((otherPoint) => {
            const dist = norm([point.x - otherPoint.x, point.y - otherPoint.y])
            if (dist === 0) return
            leastNorm = Math.min(leastNorm, dist as number)
        })
    })
    const radius = 0.4 * leastNorm

    const tmatrix = painter.getNewTransformationMatrix(scaledCoordinates)
    const scaledPainter = painter.applyNewTransformationMatrix(tmatrix)

// NOT INVERTING PROPERLY??
    console.log(JSON.stringify(props.electrodes))
    console.log(`Ranges: ${JSON.stringify(scaledCoordinates)} from ${JSON.stringify(electrodeRanges)}`)
    console.log(`LeastNorm: ${leastNorm} radius: ${radius}`)
    console.log(`Realized matrix: ${JSON.stringify(scaledPainter.getTransformationMatrix())}`)
    const pen: Pen = {color: 'rgb(22, 22, 22)', width: 3}
    scaledPainter.fillRect(scaledCoordinates, {color: 'rgb(210, 160, 220)'})
    // scaledPainter.fillRect({xmin: 0, ymin: 0, xmax: 80, ymax: 120}, {color: 'rgb(210, 160, 220)'})
    scaledPainter.fillRect({xmin: 0, ymin: 0, xmax: 63, ymax: 63}, {color: 'rgb(160, 210, 220)'})
    // ll red
    scaledPainter.drawLine(scaledCoordinates.xmin, scaledCoordinates.ymin, scaledCoordinates.xmin + 3, scaledCoordinates.ymin + 3, {color: 'rgb(255, 0, 0)', width: 3})
    // lr blue
    scaledPainter.drawLine(scaledCoordinates.xmax, scaledCoordinates.ymin, scaledCoordinates.xmax - 3, scaledCoordinates.ymin + 3, {color: 'rgb(0, 0, 255)', width: 3})
    // ul green
    scaledPainter.drawLine(scaledCoordinates.xmin, scaledCoordinates.ymax, scaledCoordinates.xmin + 3, scaledCoordinates.ymax - 3, {color: 'rgb(0, 255, 0)', width: 3})
    // ur black
    scaledPainter.drawLine(scaledCoordinates.xmax, scaledCoordinates.ymax, scaledCoordinates.xmax - 3, scaledCoordinates.ymax - 3, {color: 'rgb(0, 0, 0)', width: 3})


    props.electrodes.forEach(electrode => {
        const electrodeBoundingRect = {
            xmin: electrode.x - radius,
            ymin: electrode.y - radius,
            xmax: electrode.x + radius,
            ymax: electrode.y + radius
        }
        scaledPainter.drawEllipse(electrodeBoundingRect, pen)
        // painter.drawMarker(electrode.x, electrode.y, 20);
    })
}


interface ClickLayerProps extends ElectrodeGeometryProps {
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

// TODO: This doesn't currently work :(
interface AnimatedLayerProps extends ElectrodeGeometryProps {
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
    const { electrodes } = props;

    const testLayer = useRef(new CanvasWidgetLayer<ElectrodeGeometryProps>(paintTestLayer, props)).current
    const clickLayer = useRef(new CanvasWidgetLayer<ClickLayerProps>(paintClickLayer, {...props, clickHistory: []})).current
    const animatedLayer = useRef(new CanvasWidgetLayer<AnimatedLayerProps>(animateClickLayer, {...props, point: undefined, requestRepaint: () => (''), start: undefined })).current
    // note self-referentiality here. animatedLayer needs an ability to request its canvas schedule a repaint during its animation cycle.
    animatedLayer.setProps({...animatedLayer.getProps(), requestRepaint: animatedLayer.scheduleRepaint})
    const layers = [testLayer, clickLayer, animatedLayer]

    const _handleMouseMove = useCallback((pos: Vec2) => {
        // console.log('--- on mouse move', pos)
    }, [])
    const _handleMousePress = useCallback((pos: Vec2) => {
        const clickLayerProps = clickLayer.getProps()
        clickLayer.setProps({
            ...clickLayer.getProps(),
            clickHistory: [pos, ...clickLayerProps.clickHistory.slice(0, 9)]
        })
        clickLayer.scheduleRepaint()

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
            width={200}
            height={200}
            onMouseMove={_handleMouseMove}
            onMousePress={_handleMousePress}
            onMouseRelease={_handleMouseRelease}
            onMouseDrag={_handleMouseDrag}
            onMouseDragRelease={_handleMouseDragRelease}
        />
    )
}

export default ElectrodeGeometry