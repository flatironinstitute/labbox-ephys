import React, { FunctionComponent, useMemo } from 'react';
import { createCalculationPool, HitherJobStatusView, useHitherJob } from '../../common/hither';
import { ActionItem, DividerItem } from '../../common/Toolbars';
import { Recording, Sorting, SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';
import WaveformWidget, { ElectrodeOpts } from './WaveformWidget';

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
    customActions?: (ActionItem | DividerItem)[]
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const AverageWaveformView2: FunctionComponent<Props> = ({ sorting, recording, unitId, selection, selectionDispatch, width, height, noiseLevel, customActions }) => {
    const {result: plotData, job} = useHitherJob<PlotData>(
        'createjob_fetch_average_waveform_2',
        {
            sorting_object: sorting.sortingObject,
            recording_object: recording.recordingObject,
            unit_id: unitId,
            visible_channel_ids: selection.visibleElectrodeIds ? selection.visibleElectrodeIds : null
        },
        {useClientCache: true, calculationPool}
    )

    const electrodeOpts: ElectrodeOpts = useMemo(() => ({}), [])

    if (!plotData) {
        return <HitherJobStatusView job={job} width={width} height={height} />
    }
    return (
        <WaveformWidget
            waveform={plotData.average_waveform}
            layoutMode={selection.waveformsMode || 'geom'}
            noiseLevel={noiseLevel}
            electrodeIds={plotData.channel_ids}
            electrodeLocations={plotData.channel_locations}
            samplingFrequency={plotData.sampling_frequency}
            width={width}
            height={height}
            selection={selection}
            customActions={customActions}
            selectionDispatch={selectionDispatch}
            electrodeOpts={electrodeOpts}
        />
    )
}

export default AverageWaveformView2