import React from 'react'
import { Table, TableHead, TableRow, TableBody, TableCell } from '@material-ui/core';

const SortingInfoView = ({ sortingInfo, selectedUnitIds, focusedUnitId, onSelectedUnitIdsChanged,
                            onFocusedUnitIdChanged  }) => {
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
    
    const isSelected = (unitId) => {
        return selectedUnitIds[unitId] || false;
    }
    
    const isFocused = (unitId) => {
        return (focusedUnitId ?? -1) === unitId;
    }

    const intrange = (a, b) => {
        const lower = a < b ? a : b;
        const upper = a < b ? b : a;
        let arr = [];
        for (let n = lower; n <= upper; n++) {
            arr.push(n);
        }
        return arr;
    }
    
    // TODO: Code is all cut and pasted from AutoCorrelograms.js
    // Move to somewhere where it can actually be shared & DON'T repeat it
    const handleUnitClicked = (unitId, event) => {
        let newSelectedUnitIds = [];
        if (event.ctrlKey){
            // if ctrl modifier is set, ignore shift status, then:
            // 1. Toggle clicked element only (don't touch any existing elements) &
            // 2. Set focused id to clicked id (regardless of toggle status)
            newSelectedUnitIds = {
                ...selectedUnitIds,
                [unitId]: !(selectedUnitIds[unitId] || false)
            }
            onFocusedUnitIdChanged(unitId);
        }
        else if (event.shiftKey && focusedUnitId) {
            // if shift modifier (without ctrl modifier) & a focus exists:
            // Set selected elements to those between focus and click, inclusive.
            const intUnitId = parseInt(unitId);
            newSelectedUnitIds = Object.fromEntries(
                intrange(intUnitId, focusedUnitId).map(key => [key, true])
            );
            // do not reset focus -- no call to onFocusedUnitIdChanged()
        }
        else {
            // simple click, or shift-click without focus.
            // Select only the clicked element, and set it to focus,
            newSelectedUnitIds = {
                [unitId]: !(selectedUnitIds[unitId] || false)
            }
            onFocusedUnitIdChanged(isFocused(unitId) ? null : unitId);
        }
        onSelectedUnitIdsChanged(newSelectedUnitIds);
    }
    
    function clickabilize(unitId, idx, ary) {
        return (
            <span
                key={unitId}
                style={isSelected(unitId) ? (isFocused(unitId)? focusedStyle: selectedStyle) : unselectedStyle}
                onClick={(event) => handleUnitClicked(unitId, event)}
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