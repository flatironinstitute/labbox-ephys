import { Checkbox } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Sorting, SortingCuration, SortingInfo, SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';

type Props = {
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
}

const VisibleUnitsControl: FunctionComponent<Props> = ({ sorting, selection, selectionDispatch }) => {
    const sortingInfo = sorting.sortingInfo
    const [hideRejected, setHideRejected] = useState(false)
    const [showAcceptedOnly, setShowAcceptedOnly] = useState(false)

    const handleShowAcceptedOnly = useCallback(() => {
        setShowAcceptedOnly(!showAcceptedOnly)
    }, [setShowAcceptedOnly, showAcceptedOnly])
    const handleHideRejected = useCallback(() => {
        setHideRejected(!hideRejected)
    }, [setHideRejected, hideRejected])
    useEffect(() => {
        const includeUnit = (uid: number) => {
            if (showAcceptedOnly) {
                return getLabelsForUnitId(uid, sorting).includes('accept')
            }
            else if (hideRejected) {
                return !getLabelsForUnitId(uid, sorting).includes('reject')
            }
            else {
                return true
            }    
        }
        const visibleUnitIds = (sortingInfo?.unit_ids || []).filter(uid => includeUnit(uid))
        selectionDispatch({type: 'SetVisibleUnitIds', visibleUnitIds})
    }, [sorting, selectionDispatch, sortingInfo, showAcceptedOnly, hideRejected])

    return (
        <div>
            <span style={{whiteSpace: 'nowrap'}}><Checkbox checked={showAcceptedOnly} onClick={handleShowAcceptedOnly}/> Show accepted only</span>
            <span style={{whiteSpace: 'nowrap'}}><Checkbox checked={hideRejected} onClick={handleHideRejected} disabled={showAcceptedOnly}/> Hide rejected</span>
        </div>
    )
}

const getLabelsForUnitId = (unitId: number, sorting: Sorting) => {
    const labelsByUnit = (sorting.curation || {}).labelsByUnit || {};
    return labelsByUnit[unitId] || []
}

export default VisibleUnitsControl