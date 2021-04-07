import { createCalculationPool, useHitherJob } from 'labbox';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import HitherJobStatusView from '../../common/HitherJobStatusView';
import { applyMergesToUnit, Recording, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";
import IndividualClusterWidget from './IndividualClusterWidget';

type Props = {
    recording: Recording
    sorting: Sorting
    curation: SortingCuration
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    unitId: number
    width: number
    height: number
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

type Result = {
    timepoints: number[]
    x: number[]
    y: number[]
}

const IndividualClusterView: FunctionComponent<Props> = ({ recording, sorting, curation, selection, selectionDispatch, unitId, width, height }) => {
    const {result: features, job} = useHitherJob<Result>(
        'createjob_individual_cluster_features',
        {
            recording_object: recording.recordingObject,
            sorting_object: sorting.sortingObject,
            unit_id: applyMergesToUnit(unitId, curation, selection.applyMerges)
        },
        {
            useClientCache: true,
            calculationPool
        }
    )
    const selectedIndex: number | undefined = useMemo(() => {
        const t = selection.currentTimepoint
        if (t === undefined) return undefined
        if (features === undefined) return undefined
        for (let i = 0; i < features.timepoints.length; i++) {
            if (Math.abs(features.timepoints[i] - t) < 20) {
                return i
            }
        }
    }, [features, selection])
    const handleSelectedIndexChanged = useCallback((i: number | undefined) => {
        if (i === undefined) return
        if (features === undefined) return
        const t = features.timepoints[i]
        if (t === undefined) return
        selectionDispatch({type: 'SetCurrentTimepoint', currentTimepoint: t, ensureInRange: true})
    }, [features, selectionDispatch])
    if (!features) {
        return <HitherJobStatusView
            {...{job, width, height}}
        />
    }
    return (
        <IndividualClusterWidget
            x={features.x}
            y={features.y}
            {...{width, height, selectedIndex}}
            onSelectedIndexChanged={handleSelectedIndexChanged}
        />
    )
}

export default IndividualClusterView