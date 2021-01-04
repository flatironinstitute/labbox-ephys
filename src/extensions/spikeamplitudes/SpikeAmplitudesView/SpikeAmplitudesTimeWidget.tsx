import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { HitherContext } from '../../common/hither';
import { Recording, Sorting, SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';
import TimeWidgetNew from '../../timeseries/TimeWidgetNew/TimeWidgetNew';
import SpikeAmplitudesPanel, { combinePanels } from './SpikeAmplitudesPanel';

type Props = {
    recording: Recording
    sorting: Sorting
    unitIds: number[]
    width: number
    height: number,
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
}

const SpikeAmplitudesTimeWidget: FunctionComponent<Props> = ({ recording, sorting, unitIds, width, height, selection, selectionDispatch }) => {
    const hither = useContext(HitherContext)
    const { sortingInfo } = sorting
    const { recordingInfo } = recording

    const [spikeAmplitudesPanels, setSpikeAmplitudesPanels] = useState<SpikeAmplitudesPanel[] | null>(null)
    const [prevUnitIds, setPrevUnitIds] = useState<number[] | null>(null)
    const [prevSorting, setPrevSorting] = useState<Sorting | null>(null)

    useEffect(() => {
        if ((!spikeAmplitudesPanels) || (unitIds !== prevUnitIds) || (sorting !== prevSorting)) {
            const panels: SpikeAmplitudesPanel[] = []
            unitIds.forEach(unitId => {
                const p = new SpikeAmplitudesPanel({recording, sorting, unitId, hither})
                panels.push(p)
            })
            setSpikeAmplitudesPanels(panels)
            setPrevUnitIds(unitIds)
            setPrevSorting(sorting)
        }
    }, [spikeAmplitudesPanels, setSpikeAmplitudesPanels, unitIds, prevUnitIds, sorting, prevSorting, hither, recording])

    if (spikeAmplitudesPanels) {
        spikeAmplitudesPanels.forEach(p => p.setPanelGroup(spikeAmplitudesPanels))
    }

    if (!sortingInfo) return <div>No sorting info</div>
    if (!recordingInfo) return <div>No recording info</div>
    return (
        <TimeWidgetNew
            panels={spikeAmplitudesPanels ? [combinePanels(spikeAmplitudesPanels, '')] : [] as SpikeAmplitudesPanel[]}
            width={width}
            height={height}
            samplerate={sortingInfo.samplerate}
            maxTimeSpan={sortingInfo.samplerate * 60 * 5}
            startTimeSpan={sortingInfo.samplerate * 60 * 1}
            numTimepoints={recordingInfo.num_frames}
            currentTimepoint={selection.currentTimepoint}
            onCurrentTimepointChanged={(t: number | null) => {selectionDispatch({type: 'SetCurrentTimepoint', currentTimepoint: t})}}
            timeRange={selection.timeRange}
            onTimeRangeChanged={(r: {min: number, max: number} | null) => {selectionDispatch({type: 'SetTimeRange', timeRange: r})}}
        />
    )
}

export default SpikeAmplitudesTimeWidget