import React from 'react';
import { CanvasPainter, Vec2, Vec4 } from '../../components/jscommon/CanvasWidget/CanvasPainter';
import CanvasWidget, { CanvasWidgetLayer } from '../../components/jscommon/CanvasWidget/CanvasWidgetNew';

interface Props {
    electrodes: ({
        label: string,
        x: number,
        y: number
    })[]
}

const paintTestLayer = (painter: CanvasPainter, props: Props) => {
    painter.setPen({color: 'rgb(22, 22, 22)'});
    props.electrodes.forEach(electrode => {
        painter.drawEllipse(electrode.x - 10, electrode.y - 10, 20, 20)
        // painter.drawMarker(electrode.x, electrode.y, 20);
    })
}
const testLayer = new CanvasWidgetLayer(paintTestLayer);

const ElectrodeGeometry = (props: Props) => {
    const { electrodes } = props;
    const layers = [testLayer];

    const _handleMouseMove = (pos: Vec2) => {
        // console.log('--- on mouse move', pos)
    }
    const _handleMousePress = (pos: Vec2) => {
        console.log('--- on mouse press', pos)
    }
    const _handleMouseRelease = (pos: Vec2) => {
        console.log('--- on mouse release', pos)
    }
    const _handleMouseDrag = (args: {anchor: Vec2, pos: Vec2, rect: Vec4}) => {
        console.log('--- on mouse drag', args.rect)
    }
    const _handleMouseDragRelease = (args: {anchor: Vec2, pos: Vec2, rect: Vec4}) => {
        console.log('--- on mouse drag release', args.rect)
    }

    return (
        <CanvasWidget
            key='canvas'
            layers={layers}
            layerProps={props}
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