import React, { FunctionComponent, useContext, useEffect, useMemo, useState } from 'react';
import { useRecordingInfo, useSortingInfo } from '../../../actions/getRecordingInfo';
import { HitherContext } from '../../common/hither';
import useBufferedDispatch from '../../common/useBufferedDispatch';
import { Recording, Sorting, SortingSelection, SortingSelectionDispatch, sortingSelectionReducer } from '../../extensionInterface';
import TimeWidgetNew from '../../timeseries/TimeWidgetNew/TimeWidgetNew';
import SpikeAmplitudesPanel, { combinePanels } from './SpikeAmplitudesPanel';
import { SpikeAmplitudesData } from './useSpikeAmplitudesData';

type Props = {
    spikeAmplitudesData: SpikeAmplitudesData
    recording: Recording
    sorting: Sorting
    unitIds: number[]
    width: number
    height: number,
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
}

const SpikeAmplitudesTimeWidget: FunctionComponent<Props> = ({ spikeAmplitudesData, recording, sorting, unitIds, width, height, selection: externalSelection, selectionDispatch: externalSelectionDispatch }) => {
    const hither = useContext(HitherContext)
    const sortingInfo = useSortingInfo(sorting.sortingObject, sorting.recordingObject)
    const recordingInfo = useRecordingInfo(recording.recordingObject)

    const [selection, selectionDispatch] = useBufferedDispatch(sortingSelectionReducer, externalSelection, useMemo(() => ((state: SortingSelection) => {externalSelectionDispatch({type: 'Set', state})}), [externalSelectionDispatch]), 400)

    const [spikeAmplitudesPanels, setSpikeAmplitudesPanels] = useState<SpikeAmplitudesPanel[] | null>(null)

    useEffect(() => {
        const panels: SpikeAmplitudesPanel[] = []
        unitIds.forEach(unitId => {
            const p = new SpikeAmplitudesPanel({spikeAmplitudesData, recording, sorting, unitId, hither})
            panels.push(p)
        })
        setSpikeAmplitudesPanels(panels)
    }, [unitIds, sorting, hither, recording, spikeAmplitudesData, selection]) // important that this depends on selection so that we refresh when time range changes

    if (spikeAmplitudesPanels) {
        spikeAmplitudesPanels.forEach(p => p.setPanelGroup(spikeAmplitudesPanels))
    }

    const panels = useMemo(() => (
        spikeAmplitudesPanels ? [combinePanels(spikeAmplitudesPanels, '')] : [] as SpikeAmplitudesPanel[]
    ), [spikeAmplitudesPanels])

    if (!sortingInfo) return <div>No sorting info</div>
    if (!recordingInfo) return <div>No recording info</div>
    return (
        <TimeWidgetNew
            panels={panels}
            width={width}
            height={height}
            samplerate={sortingInfo.samplerate}
            maxTimeSpan={sortingInfo.samplerate * 60 * 5}
            startTimeSpan={sortingInfo.samplerate * 60 * 1}
            numTimepoints={recordingInfo.num_frames}
            selection={selection}
            selectionDispatch={selectionDispatch}
        />
    )
}

export default SpikeAmplitudesTimeWidget