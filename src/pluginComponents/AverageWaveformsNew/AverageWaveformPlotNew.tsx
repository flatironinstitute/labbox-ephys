import React from 'react';
import ElectrodeLayoutPlot, { ElectrodePlotData } from './ElectrodeLayoutPlot';

interface PlotData {
    average_waveform: number[][]
    channel_ids: number[],
    channel_locations: number[][],
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

    console.log('props.plotData:', props.plotData)

    // console.log(plotData);
    if (!props.plotData.average_waveform) {
        // assume no events
        return <div />;
    }

    // const factor = 1000 / props.plotData.sampling_frequency
    // const xAxisLabel = 'dt (msec)'

    const electrodes: ElectrodePlotData[] = props.plotData.channel_ids.map((ch, i) => {
        const w = props.plotData.average_waveform[i]
        const loc = props.plotData.channel_locations[i]
        return {
            label: ch + '',
            position: {x: loc[0], y: loc[1]},
            waveform: w
        }
    })

    return (
        <div className="App" style={{width: props.boxSize.width, height: props.boxSize.height, padding: 10}}
            key={"plot-"+props.argsObject.id}
        >
            <div>
                <ElectrodeLayoutPlot
                    width={props.boxSize.width}
                    height={props.boxSize.height}
                    data={{
                        waveformYScaleFactor: 1,
                        electrodes
                    }}
                    plotElectrodes={false}
                    plotWaveforms={true}
                />
            </div>
        </div>
    );
}


export default AverageWaveformPlotNew