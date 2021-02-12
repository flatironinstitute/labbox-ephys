import React, { FunctionComponent, useMemo } from 'react';
import { createCalculationPool, HitherJobStatusView, useHitherJob } from '../../common/hither';
import { ActionItem, DividerItem } from '../../common/Toolbars';
import { applyMergesToUnit, Recording, Sorting, SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';
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

const AverageWaveformView: FunctionComponent<Props> = ({ sorting, recording, unitId, selection, selectionDispatch, width, height, noiseLevel, customActions }) => {
    const {result: plotData, job} = useHitherJob<PlotData>(
        'createjob_fetch_average_waveform_2',
        {
            sorting_object: sorting.sortingObject,
            recording_object: recording.recordingObject,
            unit_id: applyMergesToUnit(unitId, sorting.curation, selection.applyMerges)
        },
        {useClientCache: true, calculationPool}
    )

    const electrodeOpts: ElectrodeOpts = useMemo(() => ({}), [])

    if (!plotData) {
        return <HitherJobStatusView job={job} width={width} height={height} />
    }
    const visibleElectrodeIds = selection.visibleElectrodeIds
    const electrodeIds = plotData.channel_ids.filter(id => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(id))))
    const electrodeLocations = plotData.channel_locations.filter((loc, ii) => ((!visibleElectrodeIds) || (visibleElectrodeIds.includes(plotData.channel_ids[ii]))))
    return (
        <WaveformWidget
            waveform={plotData.average_waveform}
            layoutMode={selection.waveformsMode || 'geom'}
            noiseLevel={noiseLevel}
            electrodeIds={electrodeIds}
            electrodeLocations={electrodeLocations}
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

export default AverageWaveformView