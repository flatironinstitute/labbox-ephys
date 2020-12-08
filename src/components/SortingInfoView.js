import React from 'react';
import SortingInfoUnitEntry from '../extensions/common/SortingInfoUnitEntry';

const SortingViewDiv = React.memo(({ unit_ids, onUnitClicked, curation, focus = null, styling, selections }) => {
    const unitTuples = unit_ids.reduce((priors, unitId) => {
        return {
            ...priors,
            [unitId]: {
                'unitStatus': 'unselected',
                'labels': ((curation[unitId] || {}).labels || []).join(", ")
            }
        }
    }, {});
    Object.keys(selections).forEach((unitId) => {
        if (!unitTuples[unitId]) return;
        if (!selections[unitId]) return;
        unitTuples[unitId]['unitStatus'] = 'selected';
    });
    if (focus && selections[focus]) {
        unitTuples[focus]['unitStatus'] = 'focused';
    }
    return (
        <div style={styling}>
            <div className={'unitIdsColumnLabelStyle'} key={'unit-ids-label'}>Unit IDs</div>
            {unit_ids.map((unitId) => (
                <SortingInfoUnitEntry
                    key={unitId}
                    unitId={unitId}
                    labels={unitTuples[unitId]['labels']}
                    unitStatus={unitTuples[unitId]['unitStatus']}
                    onUnitClicked={onUnitClicked}
                />
            ))}
        </div>
    )
})

const SortingInfoView = ({ sortingInfo, selections = {}, focus = -999, onUnitClicked=undefined, curation={}, styling=undefined }) => {
    const si = sortingInfo;
    if (!si) return <div>No sorting info found</div>;
        
    return (
        <div>
            <SortingViewDiv
                unit_ids={si.unit_ids}
                onUnitClicked={onUnitClicked}
                curation={curation}
                focus={focus}
                styling={styling}
                selections={selections}
            />
        </div>
    );
}

export default SortingInfoView;