import React from 'react'
import MatplotlibPlot from '../../components/MatplotlibPlot';
import { Grid } from '@material-ui/core';
import plotStyles from '../common/plotStyles';

const AutoCorrelograms = ({ sorting, isSelected, isFocused, onUnitClicked }) => {
    return (
        <Grid container>
            {
                sorting.sortingInfo.unit_ids.map(unitId => (
                    <Grid key={unitId} item>
                        <div style={plotStyles['plotWrapperStyle']}
                        >
                            <div
                                style={(isSelected && isSelected(unitId))
                                    ? ((isFocused && isFocused(unitId))
                                        ? plotStyles['plotFocusedStyle']
                                        : plotStyles['plotSelectedStyle']
                                    ) : plotStyles['unselectedStyle']}
                                onClick={(event) => onUnitClicked(unitId, event)}
                            >
                                <div style={{ 'textAlign': 'center' }}>
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

const label = 'Autocorrelograms'

AutoCorrelograms.sortingViewPlugin = {
    label: label
}

AutoCorrelograms.prototypeViewPlugin = {
    label: label,
    props: {
        sorting: {
            "sortingId": "t3BFJYOzea",
            "sortingLabel": "synth_magland/datasets_noise10_K10_C4/001_synth/firings_true.mda",
            "sortingPath": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth/firings_true.mda",
            "sortingObject": {
                "data": {
                    "firings": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth/firings_true.mda",
                    "samplerate": 30000
                },
                "sorting_format": "mda"
            },
            "recordingId": "6ggv3LEBUm",
            "recordingPath": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth",
            "recordingObject": {
                "data": {
                    "geom": [
                        [
                            1,
                            0
                        ],
                        [
                            2,
                            0
                        ],
                        [
                            3,
                            0
                        ],
                        [
                            4,
                            0
                        ]
                    ],
                    "params": {
                        "samplerate": 30000,
                        "spike_sign": -1
                    },
                    "raw": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth/raw.mda"
                },
                "recording_format": "mda"
            },
            "sortingInfo": {
                "samplerate": 30000,
                "unit_ids": [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10
                ]
            }
        }
    }
}

export default AutoCorrelograms