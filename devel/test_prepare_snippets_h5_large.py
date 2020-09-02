#!/usr/bin/env python

import os
import sys
import spikeextractors as se
import hither as hi
import labbox_ephys as le
import kachery_p2p as kp

# this is how the hither functions get registered
import labbox_ephys as le
thisdir = os.path.dirname(os.path.realpath(__file__))
sys.path.append(f'{thisdir}/../src')
import pluginComponents
pluginComponents # just keep the linter happy - we only need to import pluginComponents to register the hither functions

def main():
    # Sorting: cortexlab-single-phase-3 Curated (good units) for cortexlab-single-phase-3 (full)
    recording_object = kp.load_object('sha1://8b222e25bc4d9c792e4490ca322b5338e0795596/cortexlab-single-phase-3.json')
    sorting_object = {"sorting_format":"h5_v1","data":{"h5_path":"sha1://68029d0eded8ca7d8f95c16dea81318966ae9b55/sorting.h5?manifest=12b0d8e37c7050a6fe636d4c16ed143bbd5dab0c"}}
    recording = le.LabboxEphysRecordingExtractor(recording_object)
    sorting = le.LabboxEphysSortingExtractor(sorting_object)
    prepare_snippets_h5 = hi.get_function('prepare_snippets_h5')
    h5_path = prepare_snippets_h5.run(
        sorting_object=sorting_object,
        recording_object=recording_object,
        start_frame=0,
        end_frame=30000 * 240
    ).wait()
    print(h5_path)

if __name__ == '__main__':
    main()
