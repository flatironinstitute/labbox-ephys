import React, { useCallback, useRef } from 'react';
import { CanvasPainter, Pen, Vec2, Vec4 } from '../../components/jscommon/CanvasWidget/CanvasPainter';
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
    const pen: Pen = {color: 'rgb(22, 22, 22)'}
    props.electrodes.forEach(electrode => {
        const electrodeBoundingRect = {
            xmin: electrode.x - 10,
            ymin: electrode.y - 10,
            xmax: electrode.x + 10,
            ymax: electrode.y + 10
        }
        painter.drawEllipse(electrodeBoundingRect, pen)
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