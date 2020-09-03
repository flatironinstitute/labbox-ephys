#!/usr/bin/env python

import labbox_ephys as le

def main():
    recording_object = {"data":{"geom":[[1,0],[2,0],[3,0],[4,0]],"params":{"samplerate":30000,"spike_sign":-1},"raw":"sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth/raw.mda"},"recording_format":"mda"}
    sorting_object = {"data":{"firings":"sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth/firings_true.mda","samplerate":30000},"sorting_format":"mda"}
    recording = le.LabboxEphysRecordingExtractor(recording_object)
    sorting = le.LabboxEphysSortingExtractor(sorting_object)
    h5_path = le.prepare_snippets_h5.run(sorting_object=sorting_object, recording_object=recording_object).wait()
    print(h5_path)

if __name__ == '__main__':
    main()