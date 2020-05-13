import React from 'react'
import MatplotlibPlot from '../../components/MatplotlibPlot';
import { Grid } from '@material-ui/core';

const AutoCorrelograms = ({ sorting }) => {
    return (
        <Grid container>
            {
                sorting.sortingInfo.unit_ids.map(unitId => (
                    <Grid key={unitId} item>
                        <MatplotlibPlot
                            functionName='genplot_autocorrelogram'
                            functionArgs={{
                                sorting: sorting,
                                unit_id: unitId
                            }}
                        />
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