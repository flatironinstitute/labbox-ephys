import React from 'react';
import { LineSeries, XAxis, XYPlot, YAxis } from 'react-vis';

const AverageWaveform_rv = ({boxSize, plotData, argsObject = {id: 0}, title}) => {
    // plotData will be an array of [x-vals], [y-vals], and x-stepsize.
    // need to convert to an array of objects with x-y pairs.
    // We'll be doing this a LOT, it belongs elsewhere
    // const data = plotData[0].map((item, index) => {
    //     return { x: item, y: plotData[1][index] };
    // });

    // console.log(plotData);
    if (!plotData.average_waveform) {
        // assume no events
        return <div />;
    }

    const factor = 1000 / plotData.sampling_frequency
    const data = plotData.average_waveform.map((v, ii) => ({x: ii*factor, y: v}));

    const xAxisLabel = 'dt (msec)'

    return (
        <div className="App" width={boxSize.width} height={boxSize.height} display="flex"
            padding={10}
            key={"plot-"+argsObject.id}
        >
            <div style={{textAlign: 'center', fontSize: '12px'}}>{title || "Average waveform"}</div>
            <XYPlot
                margin={30}
                height={boxSize.height}
                width={boxSize.width}
            >
                <LineSeries
                    data={data}
                />
                <XAxis />
                <YAxis />
            </XYPlot>
            <div style={{textAlign: 'center', fontSize: '12px'}}>{xAxisLabel}</div>
        </div>
    );
}



export default AverageWaveform_rv;