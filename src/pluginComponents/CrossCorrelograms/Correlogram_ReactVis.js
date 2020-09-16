import React from 'react';
import { XYPlot, XAxis, YAxis, VerticalBarSeries } from 'react-vis';

const Correlogram_rv = ({boxSize, plotData, argsObject = {id: 0}, title}) => {
    // plotData will be an array of [x-vals], [y-vals], and x-stepsize.
    // need to convert to an array of objects with x-y pairs.
    // We'll be doing this a LOT, it belongs elsewhere
    if (!plotData) {
        return <div>No data</div>;
    }
    const data = plotData[0].map((item, index) => {
        return { x: item, y: plotData[1][index] };
    });

    const xAxisLabel = 'dt (msec)'

    return (
        <div className="App" width={boxSize.width} height={boxSize.height} display="flex"
            padding={10}
            key={"plot-"+argsObject.id}
        >
            <div style={{textAlign: 'center', fontSize: '12px'}}>{title}</div>
            <XYPlot
                margin={30}
                height={boxSize.height}
                width={boxSize.width}
            >
                <VerticalBarSeries data={data} />
                <XAxis />
                <YAxis />
            </XYPlot>
            <div style={{textAlign: 'center', fontSize: '12px'}}>{xAxisLabel}</div>
        </div>
    );
}



export default Correlogram_rv;