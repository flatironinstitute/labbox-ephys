import React, { FunctionComponent, useState } from 'react';
import AverageWaveformWidget from './AverageWaveformWidget';

type PlotData = {
    average_waveform: number[][]
    channel_ids: number[],
    channel_locations: number[][],
    sampling_frequency: number
}

type Props = {
    boxSize: {width: number, height: number},
    plotData: PlotData,
    argsObject: {
        id: string
    },
    title: string,
    selectedElectrodeIds?: number[],
    onSelectedElectrodeIdsChanged?: (x: number[]) => void
}

const AverageWaveformView: FunctionComponent<Props> = ({ boxSize, plotData, argsObject, title, selectedElectrodeIds, onSelectedElectrodeIdsChanged }) => {
    const [selectedElectrodeIdsInternal, setSelectedElectrodeIdsInternal] = useState<number[]>([])

    if (!plotData.average_waveform) {
        // assume no points
        return <div>No avg waveform</div>
    }
    return (
        <AverageWaveformWidget
            waveform={plotData.average_waveform}
            electrodeIds={plotData.channel_ids}
            electrodeLocations={plotData.channel_locations}
            samplingFrequency={plotData.sampling_frequency}
            width={boxSize.width}
            height={boxSize.height}
            selectedElectrodeIds={selectedElectrodeIds ? selectedElectrodeIds : selectedElectrodeIdsInternal}
            onSelectedElectrodeIdsChanged={x => {if (onSelectedElectrodeIdsChanged) onSelectedElectrodeIdsChanged(x); else setSelectedElectrodeIdsInternal(x);}}
        />
    )
}

export default AverageWaveformView