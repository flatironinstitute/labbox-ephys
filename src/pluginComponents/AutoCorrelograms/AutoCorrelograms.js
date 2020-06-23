import React from 'react'
import MatplotlibPlot from '../../components/MatplotlibPlot';
import { Grid } from '@material-ui/core';

const AutoCorrelograms = ({ sorting, selectedUnitIds, focusedUnitId, onSelectedUnitIdsChanged,
                                onFocusedUnitIdChanged }) => {

    const isSelected = (unitId) => {
        return selectedUnitIds[unitId] || false;
    }

    const isFocused = (unitId) => {
        return (focusedUnitId ?? -1) === unitId;
    }

    // TODO: Should this go in a stylesheet?
    // TODO: In any event it should definitely be shared with other components
    // Maybe pass in a "styles" object?
    const wrapperStyle = {
        'minHeight': '228px',
        'minWidth': '206px',
    }

    const focusedStyle = {
        border: 'solid 3px #4287f5',
        'backgroundColor': '#b5d1ff'
    }

    const selectedStyle = {
        border: 'solid 3px blue',
        'backgroundColor': '#b5d1ff'
    }

    const unselectedStyle = {
        border: 'solid 3px transparent'
    }

    // TODO: move somewhere better
    const intrange = (a, b) => {
        const lower = a < b ? a : b;
        const upper = a < b ? b : a;
        let arr = [];
        for (let n = lower; n <= upper; n++) {
            arr.push(n);
        }
        return arr;
    }

    // TODO: Move somewhere it can be reused
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

    return (
        <Grid container>
            {
                sorting.sortingInfo.unit_ids.map(unitId => (
                    <Grid key={unitId} item>
                        <div style={wrapperStyle}
                        >
                            <div
                                style={isSelected(unitId) ? (isFocused(unitId) ? focusedStyle : selectedStyle) : unselectedStyle}
                                onClick={(event) => handleUnitClicked(unitId, event)}
                            >
                                <div style={{'textAlign': 'center'}}>
                                    <div>Unit {unitId}</div>
                                </div>
                                <MatplotlibPlot
                                    functionName='genplot_autocorrelogram'
                                    functionArgs={{
                                        sorting_object: sorting.sortingObject,
                                        unit_id: unitId
                                    }}
                                />
                            </div>
                        </div>
                    </Grid>
                ))
            }
        </Grid>
    );
}

const label = 'Autocorrelograms - preliminary using Matplotlib'

AutoCorrelograms.sortingViewPlugin = {
    label: label
}

AutoCorrelograms.prototypeViewPlugin = {
    label: label,
    props: {
        sorting: {
            "sortingId": "qEY593gE",
            "sortingPath": "sha1://81c0a5f5311b7032a2e70b477429094415539357/firings.mda",
            "sortingObject": {
                "sorting_format": "mda",
                "data": {
                    "firings": "sha1://81c0a5f5311b7032a2e70b477429094415539357/firings.mda"
                }
            },
            "recordingId": "synth_magland/datasets_noise10_K10_C4/001_synth",
            "recordingPath": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth",
            "recordingObject": { "data": { "geom": [[1, 0], [2, 0], [3, 0], [4, 0]], "params": { "samplerate": 30000, "spike_sign": -1 }, "raw": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth/raw.mda" }, "recording_format": "mda" }, "recordingInfo": { "channel_groups": [0, 0, 0, 0], "channel_ids": [0, 1, 2, 3], "geom": [[1, 0], [2, 0], [3, 0], [4, 0]], "num_frames": 18000000, "sampling_frequency": 30000 },
            "sortingInfo": {
                "recording_path": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth",
                "samplerate": 30000,
                "sorting_path": "sha1://81c0a5f5311b7032a2e70b477429094415539357/firings.mda",
                "unit_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
            }
        }
    }
}

export default AutoCorrelograms