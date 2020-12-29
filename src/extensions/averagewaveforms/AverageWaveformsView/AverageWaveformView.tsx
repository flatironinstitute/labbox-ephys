import React, { FunctionComponent, useState } from 'react';
import { SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';
import AverageWaveformWidget from './AverageWaveformWidget';

type PlotData = {
    average_waveform: number[][]
    channel_ids: number[]
    channel_locations: number[][]
    sampling_frequency: number
}

type Props = {
    boxSize: {width: number, height: number}
    plotData: PlotData
    argsObject: {
        id: string
    }
    title: string
    noiseLevel: number
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
}

const AverageWaveformView: FunctionComponent<Props> = ({ boxSize, plotData, argsObject, title, noiseLevel, selection, selectionDispatch }) => {
    const [selectedElectrodeIdsInternal, setSelectedElectrodeIdsInternal] = useState<number[]>([])

    if (!plotData.average_waveform) {
        // assume no points
        return <div>No avg waveform</div>
    }
    return (
        <AverageWaveformWidget
            waveform={plotData.average_waveform}
            noiseLevel={noiseLevel}
            electrodeIds={plotData.channel_ids}
            electrodeLocations={plotData.channel_locations}
            samplingFrequency={plotData.sampling_frequency}
            width={boxSize.width}
            height={boxSize.height}
            selection={selection}
            selectionDispatch={selectionDispatch}
        />
    )
}

export default AverageWaveformView