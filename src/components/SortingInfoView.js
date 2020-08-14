import React from 'react';
import SortingInfoUnitEntry from '../pluginComponents/SortingInfoUnitEntry';
// import useTraceUpdate from 'use-trace-update';

const SortingInfoView = ({ sortingInfo, selections = {}, focus = -999, onUnitClicked, curation={}, styling }) => {
    // useTraceUpdate({ sortingInfo, selections, focus, onUnitClicked, curation, styling });
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
        const unitTuples = unit_ids.reduce((styleList, unitId) => {
            return {
                ...styleList,
                [unitId]: {
                    'style': unselectedStyle,
                    'labelStyle': unselectedLabelStyle,
                    'label': ((curation[unitId] || {}).labels || [])
                }
            }
        }, {});
        Object.keys(selections).forEach((unitId) => {
            if (!unitTuples[unitId]) return;
            unitTuples[unitId]['style'] = selectedStyle;
            unitTuples[unitId]['labelStyle'] = selectedLabelStyle;
        });
        if (focus !== -999 && selections[focus]) {
            unitTuples[focus]['style'] = focusedStyle;
            unitTuples[focus]['labelStyle'] = focusedLabelStyle;
        }
        return (
            <div style={styling} key={unit_ids}>
                <div style={labelStyle}>Unit IDs</div>
                {unit_ids.map((unitId, idx, ary) => (
                    <SortingInfoUnitEntry
                        unitId={unitId}
                        labels={unitTuples[unitId]['labels']}
                        unitIdStyle={unitIdStyle}
                        unitStyle={unitTuples[unitId]['style']}
                        labelStyle={unitTuples[unitId]['labelStyle']}
                        onUnitClicked={onUnitClicked}
                    />
                ))}
            </div>
        )
    }
        
    function clickabilize(unitId, idx, ary) {
        return (
            <SortingInfoUnitEntry
                unitId={unitId}
                labels = {(curation[unitId] || {}).labels || []}
                unitIdStyle={unitIdStyle}
                // unitStyle={GetUnitStyle(unitId)}
                // labelStyle={GetLabelsStyle(unitId)}
                onUnitClicked={onUnitClicked}
            />
            // <div
            //     key={unitId}
            //     style={GetUnitStyle(unitId)}
            //     onClick={(event) => onUnitClicked(unitId, event)}
            // >
            //     <span style={unitIdStyle} key={unitId + '-name'}>{unitId}</span>
            //     <span key={unitId + '-curationLabels'}>
            //         {((curation[unitId] || {}).labels || [])
            //             .map((label) => {
            //                 return (
            //                     <span style={GetLabelsStyle(unitId)}
            //                         key={unitId + '-label-' + label}
            //                     >
            //                         {label}&nbsp;
            //                     </span>
            //                 )
            //             })}
            //     </span>
            // </div>

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