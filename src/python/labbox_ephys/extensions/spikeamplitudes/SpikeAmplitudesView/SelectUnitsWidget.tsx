import React, { FunctionComponent } from 'react';
import { useSortingInfo } from '../../common/useSortingInfo';
import { isMergeGroupRepresentative, Sorting, SortingCuration, SortingSelection, SortingSelectionDispatch } from "../../pluginInterface";
import UnitsTable from '../../unitstable/Units/UnitsTable';

type Props = {
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    curation: SortingCuration
}

const SelectUnitsWidget: FunctionComponent<Props> = ({ sorting, selection, selectionDispatch, curation }) => {
    const sortingInfo = useSortingInfo(sorting.sortingObject, sorting.recordingObject)
    if (!sortingInfo) return <div>No sorting info</div>
    const unitIds = (sortingInfo?.unit_ids || [])
        .filter(uid => ((!selection.applyMerges) || (isMergeGroupRepresentative(uid, curation))))
    return (
        <UnitsTable
            units={unitIds}
            {...{selection, selectionDispatch, sorting, curation}}
        />
    )
}

export default SelectUnitsWidget