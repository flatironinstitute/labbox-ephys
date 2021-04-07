import { Checkbox } from '@material-ui/core';
import { useHitherJob } from 'labbox';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useSortingInfo } from '../../common/useSortingInfo';
import { Recording, Sorting, SortingCuration, SortingInfo, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";

type Props = {
    sorting: Sorting
    recording: Recording
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    curation: SortingCuration
}

type PeakElectrodeIds = {[key: string]: number}

const VisibleUnitsControl: FunctionComponent<Props> = ({ sorting, recording, selection, selectionDispatch, curation }) => {
    const sortingInfo: SortingInfo | undefined = useSortingInfo(sorting.sortingObject, sorting.recordingObject)
    const [hideRejected, setHideRejected] = useState(false)
    const [showAcceptedOnly, setShowAcceptedOnly] = useState(false)
    const [restrictToVisibleElectrodes, setRestrictToVisibleElectrodes] = useState(true)
    const visibleElectrodeIds = selection.visibleElectrodeIds

    const {result: peakElectrodeIds} = useHitherJob<PeakElectrodeIds>('createjob_get_peak_channels', {sorting_object: sorting.sortingObject, recording_object: recording.recordingObject}, {useClientCache: true})

    const handleShowAcceptedOnly = useCallback(() => {
        setShowAcceptedOnly(!showAcceptedOnly)
    }, [showAcceptedOnly])
    const handleHideRejected = useCallback(() => {
        setHideRejected(!hideRejected)
    }, [hideRejected])
    const handleRestrictToVisibleElectrodes = useCallback(() => {
        setRestrictToVisibleElectrodes(!restrictToVisibleElectrodes)
    }, [restrictToVisibleElectrodes])
    useEffect(() => {
        const includeUnit = (uid: number) => {
            if ((restrictToVisibleElectrodes) && (visibleElectrodeIds) && (peakElectrodeIds)) {
                const peakElectrodeId = peakElectrodeIds[uid + '']
                if (!visibleElectrodeIds.includes(peakElectrodeId)) return false
            }
            if (showAcceptedOnly) {
                return getLabelsForUnitId(uid, curation).includes('accept')
            }
            else if (hideRejected) {
                return !getLabelsForUnitId(uid, curation).includes('reject')
            }
            else {
                return true
            }    
        }
        const visibleUnitIds = (sortingInfo?.unit_ids || []).filter(uid => includeUnit(uid))
        selectionDispatch({type: 'SetVisibleUnitIds', visibleUnitIds})
    }, [sorting, selectionDispatch, sortingInfo, showAcceptedOnly, hideRejected, restrictToVisibleElectrodes, visibleElectrodeIds, peakElectrodeIds])

    return (
        <div>
            <span style={{whiteSpace: 'nowrap'}}><Checkbox checked={showAcceptedOnly} onClick={handleShowAcceptedOnly}/> Show accepted only</span>
            <span style={{whiteSpace: 'nowrap'}}><Checkbox checked={hideRejected} onClick={handleHideRejected} disabled={showAcceptedOnly}/> Hide rejected</span>
            <span style={{whiteSpace: 'nowrap'}}><Checkbox checked={restrictToVisibleElectrodes} onClick={handleRestrictToVisibleElectrodes} disabled={!visibleElectrodeIds}/> Restrict to visible electrodes</span>
        </div>
    )
}

const getLabelsForUnitId = (unitId: number, curation: SortingCuration) => {
    const labelsByUnit = (curation || {}).labelsByUnit || {};
    return labelsByUnit[unitId] || []
}

export default VisibleUnitsControl