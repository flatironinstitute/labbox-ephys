import React from 'react';
import { ChartLabel, XYPlot, XAxis, YAxis, VerticalBarSeries } from 'react-vis';

const Correlogram_rv = (boxSize, plotData, argsObject = {id: 0}) => {
    // plotData will be an array of [x-vals], [y-vals], and x-stepsize.
    // need to convert to an array of objects with x-y pairs.
    // We'll be doing this a LOT, it belongs elsewhere
    const data = plotData[0].map((item, index) => {
        return { x: item, y: plotData[1][index] };
    });

    // Note that unfortunately neither the ChartLabel method nor the XAxis title method
    // are producing good results for actually labeling the x-axis of the plot outside
    // the axis. (The XAxis title automatically displays above the axis, and if you push
    // the displacement on the ChartLabel beyond 110%, it just disappears.)
    // On ChartLabel: https://github.com/uber/react-vis/blob/master/docs/chart-label.md
    // Maybe NiVo will look better?
    return (
        <div className="App" width={boxSize.width} height={boxSize.height} display="flex"
            padding={10}
            key={"plot-"+argsObject.id}
        >
            <XYPlot
                margin={30}
                height={boxSize.height}
                width={boxSize.width}
            >
                <VerticalBarSeries data={data} />
                <XAxis title='dt (msec)' position='middle'/>
                <YAxis />
                <ChartLabel
                    text='dt (msec)'
                    includeMargin={false}
                    xPercent={.5}
                    yPercent={100}
                />
            </XYPlot>
        </div>
    );
}



export default Correlogram_rv;