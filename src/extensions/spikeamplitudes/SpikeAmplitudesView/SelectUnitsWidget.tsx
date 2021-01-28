import React, { FunctionComponent } from 'react';
import { useSortingInfo } from '../../common/getRecordingInfo';
import { Sorting, SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';
import UnitsTable from '../../unitstable/Units/UnitsTable';

type Props = {
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
}

const SelectUnitsWidget: FunctionComponent<Props> = ({ sorting, selection, selectionDispatch }) => {
    const sortingInfo = useSortingInfo(sorting.sortingObject, sorting.recordingObject)
    if (!sortingInfo) return <div>No sorting info</div>
    return (
        <UnitsTable
            units={sortingInfo?.unit_ids}
            {...{selection, selectionDispatch, sorting}}
        />
    )
}

export default SelectUnitsWidget