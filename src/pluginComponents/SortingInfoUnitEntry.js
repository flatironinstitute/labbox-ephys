import React from 'react';

const SortingInfoUnitEntry = React.memo(({
    unitId, labels = "", unitStatus = 'unselected', onUnitClicked
}) => {
    const unitClass =
        unitStatus === 'selected' ? 'selectedUnitEntry'
        : unitStatus === 'focused' ? 'focusedUnitEntry'
        : 'unselectedUnitEntry'; // default to unselected
    console.log(`Rendering unit ${unitId} with ${labels}:${unitStatus}`)
    return (
        <div
            className={unitClass}
            onClick={(event) => onUnitClicked(unitId, event)}
        >
            <span className={'unitEntryBase'}>{ unitId }</span>
            <span className={'unitLabelsStyle'}>{ labels }</span>
        </div>
    );
})

export default SortingInfoUnitEntry;