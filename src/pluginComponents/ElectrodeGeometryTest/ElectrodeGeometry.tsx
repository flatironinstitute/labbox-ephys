import React from 'react'
import CanvasWidget, { CanvasWidgetLayer } from '../../components/jscommon/CanvasWidget';

interface Props {
    electrodes: ({
        label: string,
        x: number,
        y: number
    })[]
}

const paintTestLayer = (painter: any, props: Props) => {
    painter.setPen({color: 'rgb(22, 22, 22)'});
    props.electrodes.forEach(electrode => {
        painter.drawMarker(electrode.x, electrode.y, 20);
    })
}
const testLayer = new CanvasWidgetLayer(paintTestLayer);

const ElectrodeGeometry = (props: Props) => {
    const { electrodes } = props;
    const layers = [testLayer];
    return (
        <CanvasWidget
            key='canvas'
            layers={layers}
            layerProps={props}
            width={200}
            height={200}
        />
    )
}

export default ElectrodeGeometry