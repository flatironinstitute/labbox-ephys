import React from 'react'

const SortingInfoView = ({ sortingInfo, isSelected, isFocused, onUnitClicked, curation={}, styling }) => {
    const si = sortingInfo;
    if (!si) return <div>No sorting info found</div>;

    const labelStyle = {
        'minWidth': '200px',
        'fontWeight': 'bold',
        'padding': '7px 5px 7px 5px'
    }
    
    const focusedStyle = {
        'fontWeight': 'bold',
        'border': 'solid 1px #4287f5',
        'backgroundColor': '#c0d9ff',
        'color': 'black'
        // color: '#4287f5',
        // 'backgroundColor': 'white',
    }
    
    const selectedStyle = {
        'border': 'solid 1px blue',
        'fontWeight': 'bold',
        color: 'black',
        'backgroundColor': '#b5d1ff',
    }
    
    const unselectedStyle = {
        'border': 'transparent 1px solid',
        'fontWeight': 'normal',
        color: 'black',
        'backgroundColor': 'white',
    }

    const unitIdStyle = {
        'paddingRight': '13px',
        'paddingTop': '10px'
    }

    const focusedLabelStyle = {
        'paddingRight': '3px',
        'color': '#333333'
    }

    const selectedLabelStyle = {
        'paddingRight': '3px',
        'color': '#333333'
    }

    const unselectedLabelStyle = {
        'paddingRight': '3px',
        'color': '#333333',
    }
    
    const SortingViewDiv = ({ unit_ids }) => {
        return (
            <div style={styling}>
                <div style={labelStyle}>Unit IDs</div>
                {unit_ids.map((unitId, idx, ary) => clickabilize(unitId, idx, ary))}
            </div>
        )
    }

    const GetUnitStyle = (unitId) => {
        return ((isSelected && isSelected(unitId))
                ? (isFocused && isFocused(unitId)
                    ? focusedStyle
                    : selectedStyle)
                : unselectedStyle);
    }

    const GetLabelsStyle = (unitId) => {
        return ((isSelected && isSelected(unitId))
                ? ((isFocused && isFocused(unitId))
                    ? focusedLabelStyle
                    : selectedLabelStyle)
                : unselectedLabelStyle);
    }
        
    function clickabilize(unitId, idx, ary) {
        return (
            <div
                key={unitId}
                style={GetUnitStyle(unitId)}
                onClick={(event) => onUnitClicked(unitId, event)}
            >
                <span style={unitIdStyle}>{unitId}</span>
                <span>
                    {((curation[unitId] || {}).labels || [])
                        .map((label) => {
                            return (
                                <span style={GetLabelsStyle(unitId)}>
                                    {label}&nbsp;
                                </span>
                            )
                        })}
                </span>
            </div>
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