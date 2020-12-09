import React, { FunctionComponent } from 'react';

interface Props {
    unitId: number
    labels: string
    unitStatus: 'unselected' | 'selected' | 'focused'
    onUnitClicked: (unitId: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const SortingInfoUnitEntry: FunctionComponent<Props> = ({
    unitId, labels = "", unitStatus = 'unselected', onUnitClicked
}) => {
    const unitClass =
        unitStatus === 'selected' ? 'selectedUnitEntry'
        : unitStatus === 'focused' ? 'focusedUnitEntry'
        : 'unselectedUnitEntry'; // default to unselected
    return (
        <div
            className={unitClass}
            onClick={(event) => onUnitClicked(unitId, event)}
        >
            <span className={'unitEntryBase'}>{ unitId }</span>
            <span className={'unitLabelsStyle'}>{ labels }</span>
        </div>
    );
}

export default SortingInfoUnitEntry;