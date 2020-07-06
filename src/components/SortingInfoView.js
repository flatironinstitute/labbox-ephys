import React from 'react'

const SortingInfoView = ({ sortingInfo, isSelected, isFocused, onUnitClicked, curation, styling }) => {
    const si = sortingInfo;
    if (!si) return <div>No sorting info found</div>;

    const labelStyle = {
        'minWidth': '200px',
        'fontWeight': 'bold',
        'padding': '7px 5px 7px 5px'
    }
    
    const focusedStyle = {
        'fontWeight': 'bold',
        color: '#4287f5',
        'backgroundColor': 'white',
    }
    
    const selectedStyle = {
        'fontWeight': 'bold',
        color: 'blue',
        'backgroundColor': 'white',
    }
    
    const unselectedStyle = {
        'fontWeight': 'normal',
        color: 'black',
        'backgroundColor': 'white',
    }

    const unitIdStyle = {
        'paddingRight': '13px',
        'paddingTop': '10px'
    }

    const labelListStyle = {
        'paddingRight': '3px',
        'color': '#333333',
        'backgroundColor': 'white'
    }
    
    const SortingViewDiv = ({ unit_ids }) => {
        return (
            <div style={styling}>
                <div style={labelStyle}>Unit IDs</div>
                {unit_ids.map((unitId, idx, ary) => clickabilize(unitId, idx, ary))}
            </div>
        )
    }
        
    function clickabilize(unitId, idx, ary) {
        return (
            <div
                key={unitId}
                style={(isSelected && isSelected(unitId)) ? (isFocused(unitId)? focusedStyle: selectedStyle) : unselectedStyle}
                onClick={(event) => onUnitClicked(unitId, event)}
            >
                <span style={unitIdStyle}>{unitId}</span>
                <span>
                    {((curation[unitId] || {}).labels || [])
                        .map((label) => {
                            return (
                                <span style={labelListStyle}>
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