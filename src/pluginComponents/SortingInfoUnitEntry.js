import React from 'react';

const SortingInfoUnitEntry = React.memo(({
    unitId, labels = [], unitIdStyle = {}, unitStyle = {}, labelStyle = {},
    onUnitClicked
}) => {
    console.log(`Rendering unit ${unitId}`)
    return (
        <div
            key={unitId}
            style={unitStyle}
            onClick={(event) => onUnitClicked(unitId, event)}
        >
            <span style={unitIdStyle} key={unitId + '-name'}>{unitId}</span>
            <span key={unitId + '-curationLabels'}>
                { labels.map((label) => {
                        return (
                            <span style={labelStyle}
                                key={unitId + '-label-' + label}
                            >
                                {label}&nbsp;
                            </span>
                        )
                    })}
            </span>
        </div>
    );
})

export default SortingInfoUnitEntry;