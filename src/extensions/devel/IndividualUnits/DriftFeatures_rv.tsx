import React, { FunctionComponent } from 'react';
import { MarkSeries, MarkSeriesPoint, XAxis, XYPlot, YAxis } from 'react-vis';

interface Props {
    boxSize: {width: number, height: number}
    plotData: any
    argsObject: any
    title: string
}

const DriftFeatures_rv: FunctionComponent<Props> = ({boxSize, plotData, argsObject = {id: 0, onPointClicked: null}, title}) => {
    // plotData: {times, features, labels}

    // console.log(plotData);
    if (!plotData.features) {
        // assume no events
        return <div />;
    }

    const xAxisLabel = 'Time (min)';
    const yAxisLabel = 'PCA 1';

    const { times, features, labels } = plotData;

    const data = features[0].map((v: number, ii: number) => ({index: ii, x: times[ii] / 60, y: features[0][ii], color: labels[ii]}));

    const _handlePointClick = (event: MarkSeriesPoint) => {
        argsObject.onPointClicked && argsObject.onPointClicked({index: event.index});
    }

    return (
        <div className="App" key={"plot-"+argsObject.id}>
            <div style={{textAlign: 'center', fontSize: '12px'}}>{ title || "Waveform features over time"}</div>
            <XYPlot
                margin={30}
                height={boxSize.height}
                width={boxSize.width}
            >
                <MarkSeries
                    data={data}
                    stroke="black"
                    // size={4}
                    onValueClick={event => _handlePointClick(event)}
                />
                <XAxis title={xAxisLabel} />
                <YAxis title={yAxisLabel} />
            </XYPlot>
            
        </div>
    );
}



export default DriftFeatures_rv;