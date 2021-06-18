#!/usr/bin/env python

import labbox_ephys as le
import kachery_client as kc

def main():
    # Sorting: cortexlab-single-phase-3 Curated (good units) for cortexlab-single-phase-3 (full)
    recording_object = kc.load_json('sha1://8b222e25bc4d9c792e4490ca322b5338e0795596/cortexlab-single-phase-3.json')
    sorting_object = {"sorting_format":"h5_v1","data":{"h5_path":"sha1://68029d0eded8ca7d8f95c16dea81318966ae9b55/sorting.h5?manifest=12b0d8e37c7050a6fe636d4c16ed143bbd5dab0c"}}
    recording = le.LabboxEphysRecordingExtractor(recording_object)
    sorting = le.LabboxEphysSortingExtractor(sorting_object)
    h5_path = le.prepare_snippets_h5.run(
        sorting_object=sorting_object,
        recording_object=recording_object,
        start_frame=0,
        end_frame=30000 * 240
    ).wait()
    print(h5_path)

if __name__ == '__main__':
    main()
