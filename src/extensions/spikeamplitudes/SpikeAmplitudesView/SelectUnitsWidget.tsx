import React, { FunctionComponent } from 'react';
import { useSortingInfo } from '../../common/useSortingInfo';
import { isMergeGroupRepresentative, Sorting, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";
import UnitsTable from '../../unitstable/Units/UnitsTable';

type Props = {
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
}

const SelectUnitsWidget: FunctionComponent<Props> = ({ sorting, selection, selectionDispatch }) => {
    const sortingInfo = useSortingInfo(sorting.sortingObject, sorting.recordingObject)
    if (!sortingInfo) return <div>No sorting info</div>
    const unitIds = (sortingInfo?.unit_ids || [])
        .filter(uid => ((!selection.applyMerges) || (isMergeGroupRepresentative(uid, sorting.curation))))
    return (
        <UnitsTable
            units={unitIds}
            {...{selection, selectionDispatch, sorting}}
        />
    )
}

export default SelectUnitsWidget