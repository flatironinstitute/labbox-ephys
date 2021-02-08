import React, { FunctionComponent, useContext, useEffect, useMemo, useState } from 'react';
import { HitherContext } from '../../common/hither';
import useBufferedDispatch from '../../common/useBufferedDispatch';
import { useRecordingInfo } from '../../common/useRecordingInfo';
import { useSortingInfo } from '../../common/useSortingInfo';
import { getArrayMax, getArrayMin } from '../../common/Utility';
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
        const allMins: number[] = []
        const allMaxs: number[] = []

        unitIds.forEach(unitId => {
            const p = new SpikeAmplitudesPanel({spikeAmplitudesData, recording, sorting, unitId, hither})
            const amps = spikeAmplitudesData.getSpikeAmplitudes(unitId)
            if (amps) {
                allMins.push(amps.minAmp)
                allMaxs.push(amps.maxAmp)
            }
            panels.push(p)
        })
        if (allMins.length > 0) {
            panels.forEach(p => {
                p.setGlobalAmplitudeRange({min: getArrayMin(allMins), max: getArrayMax(allMaxs)})
            })
        }
        setSpikeAmplitudesPanels(panels)
    }, [unitIds, sorting, hither, recording, spikeAmplitudesData, selection]) // important that this depends on selection so that we refresh when time range changes

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