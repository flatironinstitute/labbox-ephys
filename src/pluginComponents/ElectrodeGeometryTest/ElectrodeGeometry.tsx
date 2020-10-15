import React, { useCallback, useRef } from 'react';
import { CanvasPainter, Vec2, Vec4 } from '../../components/jscommon/CanvasWidget/CanvasPainter';
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
    painter.setPen({color: 'rgb(22, 22, 22)'});
    props.electrodes.forEach(electrode => {
        painter.drawEllipse(electrode.x - 10, electrode.y - 10, 20, 20)
        // painter.drawMarker(electrode.x, electrode.y, 20);
    })
}
// const testLayer = new CanvasWidgetLayer(paintTestLayer);


// This is probably not a great idea, but getting the most rigorous typing setup wasn't my priority here
interface ClickLayerProps extends ElectrodeGeometryProps {
    clickHistory: Vec2[]
}
const paintClickLayer = (painter: CanvasPainter, props: ClickLayerProps) => {
    console.log('PaintClickLayer')
    // painter.clear() // this draws a transparent rectangle above everything, w/out clearing layer's prior contents
    painter.wipe()
    let i = 0
    props.clickHistory.forEach(point => {
        const color = i * 50
        painter.setPen({color: `rgb(${color}, 0, 128)`, width: 3})
        painter.drawEllipse(point[0] - 5, point[1] - 5, 10, 10)
        i++
    })
}
// const clickLayer = new CanvasWidgetLayer(clickTestLayer)



const ElectrodeGeometry = (props: ElectrodeGeometryProps) => {
    const { electrodes } = props;

    const testLayer = useRef(new CanvasWidgetLayer<ElectrodeGeometryProps>(paintTestLayer, props)).current
    const clickLayer = useRef(new CanvasWidgetLayer<ClickLayerProps>(paintClickLayer, {...props, clickHistory: []})).current
    const layers = [testLayer, clickLayer]

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
        // layers[1].repaintImmediate()
        // layers[1].scheduleRepaint()
        // Repainting, whether scheduled or immediate, only takes effect on the *next*
        // click.
        // however, if I add a wipe to both layers & bypass CanvasWidgetLayer._initialize()'s
        // change check, it will display correctly from the initial 're'paint.
        // Not really sure the best way to do this: the repaint timeout isn't doing what
        // I want it to do, but it does feel like a persistent object shouldn't be always
        // reinitializing...
        // also not being able to schedule repaints will prevent us from doing any sort of
        // animation, which could be a real loss for displaying trends over the probe
        // (eg a popcorn hotspot/unit-firing view)
        console.log('--- on mouse press', pos)
    }, [])
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