import React, { FunctionComponent } from 'react';
import { LineSeries, XAxis, XYPlot, YAxis } from 'react-vis';

interface Props {
    boxSize: {width: number, height: number}
    plotData: any
    argsObject: any
    title: string
}

const SpikeWaveforms_rv: FunctionComponent<Props> = ({boxSize, plotData, argsObject = {id: 0}, title}) => {

    if (!plotData.spikes) {
        return <div />;
    }

    const {spikes, sampling_frequency} = plotData;

    const factor = 1000 / sampling_frequency

    const xAxisLabel = 'dt (msec)'

    return (
        <div className="App" key={"plot-"+argsObject.id}>
            <div style={{textAlign: 'center', fontSize: '12px'}}>{title || "Spike waveform(s)"}</div>
            <XYPlot
                margin={30}
                height={boxSize.height}
                width={boxSize.width}
            >
                {
                    spikes.map((spike: {waveform: number[]}, ispike: boolean) => {
                        const data = spike.waveform.map((v, ii) => ({x: ii*factor, y: v}));
                        return (
                            <LineSeries
                                key={ispike + ''}
                                data={data}
                            />
                        )
                    })
                }
                <XAxis />
                <YAxis />
            </XYPlot>
            <div style={{textAlign: 'center', fontSize: '12px'}}>{xAxisLabel}</div>
        </div>
    );
}



export default SpikeWaveforms_rv;