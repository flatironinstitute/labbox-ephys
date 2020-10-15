import React, { useRef } from 'react';
import { CanvasPainter, PainterPath } from '../../components/jscommon/CanvasWidget/CanvasPainter';
import CanvasWidget, { CanvasWidgetLayer } from '../../components/jscommon/CanvasWidget/CanvasWidgetNew';

interface PlotData {
    average_waveform: number[]
    sampling_frequency: number
}

interface Props {
    boxSize: {width: number, height: number},
    plotData: PlotData,
    argsObject: {
        id: string
    },
    title: string
}

const AverageWaveformPlotNew = (props: Props) => {
    // plotData will be an array of [x-vals], [y-vals], and x-stepsize.
    // need to convert to an array of objects with x-y pairs.
    // We'll be doing this a LOT, it belongs elsewhere
    // const data = plotData[0].map((item, index) => {
    //     return { x: item, y: plotData[1][index] };
    // });

    // console.log(plotData);
    if (!props.plotData.average_waveform) {
        // assume no events
        return <div />;
    }

    const factor = 1000 / props.plotData.sampling_frequency
    const data = props.plotData.average_waveform.map((v, ii) => ({x: ii*factor, y: v}));

    const xAxisLabel = 'dt (msec)'

    return (
        <div className="App" style={{width: props.boxSize.width, height: props.boxSize.height, display: "flex", padding: 10}}
            key={"plot-"+props.argsObject.id}
        >
            <div style={{textAlign: 'center', fontSize: '12px'}}>{props.title || "Average waveform"}</div>
            <HelperPlot
                width={props.boxSize.width}
                height={props.boxSize.height}
                data={data}
            />
            <div style={{textAlign: 'center', fontSize: '12px'}}>{xAxisLabel}</div>
        </div>
    );
}

interface HelperPlotProps {
    width: number
    height: number
    data: {x: number, y: number}[]
}

const paintCanvasWidgetLayer = (painter: CanvasPainter, props: HelperPlotProps) => {
    painter.setBrush({color: 'green'})

    const { data } = props

    const xmin = Math.min(...data.map(a => (a.x)))
    const xmax = Math.max(...data.map(a => (a.x)))
    const ymin = Math.min(...data.map(a => (a.y)))
    const ymax = Math.max(...data.map(a => (a.y)))

    painter.setCoordRange(xmin, xmax, ymin, ymax)
    painter.useCoords()

    const path = new PainterPath()
    data.forEach(a => {
        path.lineTo(a.x, a.y)
    })
    painter.drawPath(path)
}

const HelperPlot = (props: HelperPlotProps) => {

    const plotWaveformLayer = useRef(new CanvasWidgetLayer<HelperPlotProps>(paintCanvasWidgetLayer, props)).current

    const layers = [plotWaveformLayer]
    return (
        <CanvasWidget
            layers={layers}
            width={props.width}
            height={props.height}
            onMouseMove={() => {}}
            onMousePress={() => {}}
            onMouseRelease={() => {}}
            onMouseDrag={() => {}}
            onMouseDragRelease={() => {}}
        />
    )
}



export default AverageWaveformPlotNew