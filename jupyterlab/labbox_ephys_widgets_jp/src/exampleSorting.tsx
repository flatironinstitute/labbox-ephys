import { Recording, Sorting } from "./extensions/pluginInterface"

const sorting: Sorting = {
    "sortingId": "Sp1x3b34l5",
    "sortingLabel": "synth_magland/datasets_noise10_K10_C4/001_synth/firings_true.mda",
    "sortingPath": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth/firings_true.mda",
    "sortingObject": {
        "sorting_format": "mda",
        "data": {
            "firings": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth/firings_true.mda",
            "samplerate": 30000
        }
    },
    "recordingId": "jocL4pWqEu",
    "recordingPath": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth",
    "recordingObject": {
        "recording_format": "mda",
        "data": {
            "raw": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth/raw.mda",
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
            }
        }
    }
}

const recording: Recording = {
    "recordingId": "jocL4pWqEu",
    "recordingLabel": "synth_magland/datasets_noise10_K10_C4/001_synth",
    "recordingPath": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth",
    "recordingObject": {
        "recording_format": "mda",
        "data": {
            "raw": "sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth/raw.mda",
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
            }
        }
    }
}

const exampleSorting = (): {sorting: Sorting, recording: Recording} => {
    return {sorting, recording}
}

export default exampleSorting