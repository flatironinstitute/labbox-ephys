import React, { useRef } from 'react';
import { CanvasPainter, PainterPath } from '../../components/jscommon/CanvasWidget/CanvasPainter';
import { CanvasWidgetLayer } from '../../components/jscommon/CanvasWidget/CanvasWidgetLayer';
import CanvasWidget from '../../components/jscommon/CanvasWidget/CanvasWidgetNew';

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

    // Note: resorted to a grid layout, which Works. Have to trim the height of the drawing area to match since we're giving it
    // 5 of the 7 available rows; this seems to look good on my monitor, but if we wanted a different ratio we'd just need
    // to make sure to edit the grid template and the height adjustment in concert.
    return (
        <div className="App" style={{width: props.boxSize.width, height: props.boxSize.height, padding: 10, clear: 'both',
                                    display: "grid", gridTemplateRows: "repeat(7, 1fr)", gridTemplateColumns: "repeat(1, 1fr)"}}
            key={"plot-"+props.argsObject.id}
        >
            <div style={{textAlign: 'center', fontSize: '12px', gridArea: "1 / 1 / 2 / 2"}}>{props.title || "Average waveform"}</div>
            <HelperPlot
                width={props.boxSize.width}
                height={props.boxSize.height * 5 / 7}
                data={data}
            />
            <div style={{textAlign: 'center', fontSize: '12px',  gridArea: "7 / 1 / 8 / 2"}}>{xAxisLabel}</div>
        </div>
    );
}

interface HelperPlotProps {
    width: number
    height: number
    data: {x: number, y: number}[]
}

const paintCanvasWidgetLayer = (painter: CanvasPainter, props: HelperPlotProps) => {
    // const brush = {color: 'green'}
    const { data } = props    

    const path = new PainterPath()
    data.forEach(a => {
        path.lineTo(a.x, a.y)
    })
    painter.drawPath(path, painter.getDefaultPen())
}

const setCanvasFromProps = (layer: CanvasWidgetLayer<HelperPlotProps, any>, layerProps: HelperPlotProps) => {
    const data = layerProps.data
    const optimalBoundingRectangle = {
        xmin: Math.min(...data.map(a => (a.x))),
        xmax: Math.max(...data.map(a => (a.x))),
        ymin: Math.min(...data.map(a => (a.y))),
        ymax: Math.max(...data.map(a => (a.y)))    
    }
    layer.setBasePixelTransformationMatrix(optimalBoundingRectangle)
    // Optional: If you want to set a margin, just bump up the coordinate range of the drawing area by some small amount,
    // e.g. 5% on each side or something.

    // This is what you would do if for some reason you had to set it to a default coordinate system first:
    // const newTransform = getUpdatedTransformationMatrix(optimalBoundingRectangle, layer.getCoordRange(), layer.getTransformMatrix())
    // layer.setTransformMatrix(newTransform)
    // layer.setCoordRange(optimalBoundingRectangle)
    // (Note that that could certainly be simplified. But it's even simpler to do it right the first time...)
}

const HelperPlot = (props: HelperPlotProps) => {
    const plotWaveformLayer = useRef(new CanvasWidgetLayer<HelperPlotProps, any>(paintCanvasWidgetLayer, setCanvasFromProps, {})).current
    // // In general would be better to set it right the first time--I don't see a way to trigger it here, but I am
    // // concerned that with this pattern, we could wind up progressively shrinking or monkeying with our drawing area
    // // by re-applying this set of coordinate system transforms when it was already set up correctly the first time.

    const layers = [plotWaveformLayer]
    return (
        <div style={{gridArea: "2 / 1 / 7 / 2"}}>
            <CanvasWidget<HelperPlotProps>
                layers={layers}
                widgetProps={props}
            />
        </div>
    )
}


export default AverageWaveformPlotNew