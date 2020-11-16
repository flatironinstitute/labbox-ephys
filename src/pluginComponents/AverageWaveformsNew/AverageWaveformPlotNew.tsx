import React from 'react';
import { CanvasPainter, PainterPath } from '../../components/jscommon/CanvasWidget/CanvasPainter';
// import { CanvasWidgetLayer } from '../../components/jscommon/CanvasWidget/CanvasWidgetLayer';
import CanvasWidget from '../../components/jscommon/CanvasWidget/CanvasWidgetNew';
// import { getUpdatedTransformationMatrix } from '../../components/jscommon/CanvasWidget/Geometry';

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

    // TODO: The 'Average Waveform' label is rendering next to the canvas and displacing it to the right,
    // which isn't what we want. I've compensated below by narrowing the drawing window, but it'd be better
    // to just do it right.
    // I figure this is out of scope for what I'm currently rewriting though.
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
    const brush = {color: 'green'}
    const { data } = props    

    const path = new PainterPath()
    data.forEach(a => {
        path.lineTo(a.x, a.y)
    })
    painter.drawPath(path, painter.getDefaultPen())
}

const HelperPlot = (props: HelperPlotProps) => {
    const { data } = props
    const optimalBoundingRectangle = {
        xmin: Math.min(...data.map(a => (a.x))),
        xmax: Math.max(...data.map(a => (a.x))),
        ymin: Math.min(...data.map(a => (a.y))),
        ymax: Math.max(...data.map(a => (a.y)))    
    }
    const targetInCurrentCoordinateSystem = {
        xmin: 0,
        xmax: 0.8,
        ymin: 0,
        ymax: 0.75
    }
    // const plotWaveformLayer = useRef(new CanvasWidgetLayer<HelperPlotProps>(paintCanvasWidgetLayer, props)).current
    // const T = getUpdatedTransformationMatrix(optimalBoundingRectangle, targetInCurrentCoordinateSystem, plotWaveformLayer.getTransformMatrix())
    // // In general would be better to set it right the first time--I don't see a way to trigger it here, but I am
    // // concerned that with this pattern, we could wind up progressively shrinking or monkeying with our drawing area
    // // by re-applying this set of coordinate system transforms when it was already set up correctly the first time.
    // plotWaveformLayer.updateTransformAndCoordinateSystem(T, optimalBoundingRectangle)

    // const layers = [plotWaveformLayer]
    return (
        <CanvasWidget<HelperPlotProps>
            layers={[]}//{layers}
            widgetProps={props}
        />
    )
}


export default AverageWaveformPlotNew