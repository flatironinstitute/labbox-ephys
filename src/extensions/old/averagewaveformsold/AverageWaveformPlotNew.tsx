import React from 'react';
import CanvasWidget, { funcToTransform } from '../../common/CanvasWidget';
import { CanvasPainter, PainterPath } from '../../common/CanvasWidget/CanvasPainter';
import { CanvasWidgetLayer, useLayer, useLayers } from '../../common/CanvasWidget/CanvasWidgetLayer';
import { Vec2 } from '../../common/CanvasWidget/Geometry';

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

interface HelperPlotState {
    
}

// const setCanvasFromProps = (layer: CanvasWidgetLayer<HelperPlotProps, any>, layerProps: HelperPlotProps) => {
    
//     // layer.setBasePixelTransformationMatrix(optimalBoundingRectangle)
//     // Optional: If you want to set a margin, just bump up the coordinate range of the drawing area by some small amount,
//     // e.g. 5% on each side or something.

//     // This is what you would do if for some reason you had to set it to a default coordinate system first:
//     // const newTransform = getUpdatedTransformationMatrix(optimalBoundingRectangle, layer.getCoordRange(), layer.getTransformMatrix())
//     // layer.setTransformMatrix(newTransform)
//     // layer.setCoordRange(optimalBoundingRectangle)
//     // (Note that that could certainly be simplified. But it's even simpler to do it right the first time...)
// }

const createPlotWaveformLayer = () => {

    const onPaint = (painter: CanvasPainter, layerProps: HelperPlotProps, state: HelperPlotState) => {
        // const brush = {color: 'green'}
        const { data } = layerProps    

        const path = new PainterPath()
        data.forEach(a => {
            path.lineTo(a.x, a.y)
        })
        painter.drawPath(path, painter.getDefaultPen())
    }

    const onPropsChange = (layer: CanvasWidgetLayer<HelperPlotProps, HelperPlotState>, layerProps: HelperPlotProps) => {
        const { data, width, height } = layerProps
        const boundingRectangle = {
            xmin: getMin(data.map(a => (a.x))),
            xmax: getMax(data.map(a => (a.x))),
            ymin: getMin(data.map(a => (a.y))),
            ymax: getMax(data.map(a => (a.y)))    
        }
        const margins = {
            left: 20, right: 20,
            top: 20, bottom: 20
        }
        const transform = funcToTransform((p: Vec2) => {
            const x1 = p[0]
            const y1 = p[1]
            const xfrac = (x1 - boundingRectangle.xmin) / (boundingRectangle.xmax - boundingRectangle.xmin)
            const yfrac = (y1 - boundingRectangle.ymin) / (boundingRectangle.ymax - boundingRectangle.ymin)
            const W = width - margins.left - margins.right
            const H = height - margins.top - margins.bottom
            const x2 = margins.left + xfrac * W
            const y2 = height - margins.bottom - yfrac * H
            return [x2, y2]
        })
        layer.setTransformMatrix(transform)
    }

    return new CanvasWidgetLayer<HelperPlotProps, HelperPlotState>(onPaint, onPropsChange, {})
}

const HelperPlot = (props: HelperPlotProps) => {
    const plotWaveformLayer = useLayer(createPlotWaveformLayer, props)
    const layers = useLayers([plotWaveformLayer])
    return (
        <div style={{gridArea: "2 / 1 / 7 / 2"}}>
            <CanvasWidget
                layers={layers}
                width={props.width}
                height={props.height}
            />
        </div>
    )
}

function getMin(arr: number[]) {
    return arr.reduce((max: number, v: number) => max <= v ? max : v, Infinity);
}

function getMax(arr: number[]) {
    return arr.reduce((max: number, v: number) => max >= v ? max : v, -Infinity);
}


export default AverageWaveformPlotNew