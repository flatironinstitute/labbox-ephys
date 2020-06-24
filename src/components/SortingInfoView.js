import React from 'react'

const SortingInfoView = ({ sortingInfo, isSelected, isFocused, onUnitClicked }) => {
    const si = sortingInfo;
    if (!si) return <div>No sorting info found</div>;

    const labelStyle = {
        'minWidth': '200px',
        'display': 'inline-block'
    }
    
    const focusedStyle = {
        'fontWeight': 'bold',
        color: '#4287f5',
        'backgroundColor': 'white'
    }
    
    const selectedStyle = {
        'fontWeight': 'bold',
        color: 'blue',
        'backgroundColor': 'white'
    }
    
    const unselectedStyle = {
        'fontWeight': 'normal',
        color: 'black',
        'backgroundColor': 'white'
    }
    
    const SortingViewDiv = ({ unit_ids }) => {
        return (
            <div style={{ width: 600 }}>
                <span style={labelStyle}>Unit IDs</span>
                <span>{unit_ids.map((unitId, idx, ary) => clickabilize(unitId, idx, ary))} </span>
            </div>
        )
    }
        
    function clickabilize(unitId, idx, ary) {
        return (
            <span
                key={unitId}
                style={isSelected(unitId) ? (isFocused(unitId)? focusedStyle: selectedStyle) : unselectedStyle}
                onClick={(event) => onUnitClicked(unitId, event)}
            >
                {unitId}{idx === ary.length - 1 ? '' : ', '}
            </span>
        );
    }

    return (
        <div>
            <SortingViewDiv unit_ids={si.unit_ids}
            />
        </div>
    );
}

export default SortingInfoView;