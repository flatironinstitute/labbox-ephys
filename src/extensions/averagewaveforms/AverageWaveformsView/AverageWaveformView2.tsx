import React, { FunctionComponent } from 'react';
import createCalculationPool from '../../common/createCalculationPool';
import HitherJobStatusView from '../../common/HitherJobStatusView';
import useHitherJob from '../../common/useHitherJob';
import { Recording, Sorting, SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';
import AverageWaveformWidget from './AverageWaveformWidget';

type PlotData = {
    average_waveform: number[][]
    channel_ids: number[]
    channel_locations: number[][]
    sampling_frequency: number
}

type Props = {
    sorting: Sorting
    recording: Recording
    unitId: number
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    width: number
    height: number
    noiseLevel: number
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const AverageWaveformView2: FunctionComponent<Props> = ({ sorting, recording, unitId, selection, selectionDispatch, width, height, noiseLevel }) => {
    const {result: plotData, job} = useHitherJob<PlotData>(
        'createjob_fetch_average_waveform_2',
        {
            sorting_object: sorting.sortingObject,
            recording_object: recording.recordingObject,
            unit_id: unitId
        },
        {useClientCache: true, calculationPool}
    )

    if (!plotData) {
        return <HitherJobStatusView job={job} width={width} height={height} />
    }
    return (
        <AverageWaveformWidget
            waveform={plotData.average_waveform}
            noiseLevel={noiseLevel}
            electrodeIds={plotData.channel_ids}
            electrodeLocations={plotData.channel_locations}
            samplingFrequency={plotData.sampling_frequency}
            width={width}
            height={height}
            selection={selection}
            selectionDispatch={selectionDispatch}
        />
    )
}

export default AverageWaveformView2