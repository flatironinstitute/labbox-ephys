#!/usr/bin/env python3

import kachery_client as kc
import labbox_ephys as le


def main():
    # previously:
    # kc.set('example-nwb-workspace', le.create_workspace())
    # kc.set('example-nwb-file', 'sha1://....') # set the URI of the nwb file
    workspace = le.load_workspace(kc.get('example-nwb-workspace'))
    nwb_file_uri = kc.get('example-nwb-file')
    
    print(f'Workspace URI: {workspace.uri}')

    recording = le.LabboxEphysRecordingExtractor({
        'recording_format': 'nwb',
        'data': {
            'path': nwb_file_uri
        }
    })
    sorting = le.LabboxEphysSortingExtractor({
        'sorting_format': 'nwb',
        'data': {
            'path': nwb_file_uri
        }
    })

    recording_label = 'senor_test_R'
    sorting_label = 'senor_test_S'

    R_id = workspace.add_recording(recording=recording, label=recording_label)
    S_id = workspace.add_sorting(sorting=sorting, recording_id=R_id, label=sorting_label)


if __name__ == '__main__':
    main()