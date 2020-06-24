import React from 'react'
import NiceTable from '../../components/NiceTable'

const Units = ({ sorting, recording, isSelected, isFocused, onUnitClicked }) => {
    const selectedRowKeys = []; // TODO: define this based on isSelected
    const handleSelectedRowKeysChanged = (keys) => {
        // todo: we need an additional callback to set the selected unit ids
    }
    const rows = sorting.sortingInfo.unit_ids.map(unitId => ({
        key: unitId,
        unitId: unitId,
    }))
    const columns = [
        {
            key: 'unitId',
            label: 'Unit ID'
        }
    ];
    // todo: define additional columns such as: num. events, avg. firing rate, snr, ...
    return (
        <NiceTable
            rows={rows}
            columns={columns}
            selectionMode='multiple'
            selectedRowKeys={selectedRowKeys}
            onSelectedRowKeysChanged={(keys) => {handleSelectedRowKeysChanged(keys)}}
        />
    );
}

const label = 'Units'

Units.sortingViewPlugin = {
    label: label
}

Units.prototypeViewPlugin = {
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

export default Units