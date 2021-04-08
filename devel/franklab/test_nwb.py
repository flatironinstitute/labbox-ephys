#!/usr/bin/env python3

import kachery_p2p as kp
import labbox_ephys as le


def main():
    # previously: kp.set('franklab-example-nwb', 'sha1://...')
    uri = kp.get_string('franklab-example-nwb')
    
    feed = kp.load_feed('franklab-example-feed', create=True)
    workspace = le.load_workspace(workspace_uri=f'workspace://{feed.get_feed_id()}/default')
    print(f'Workspace URI: {workspace.get_uri()}')

    recording = le.LabboxEphysRecordingExtractor({
        'recording_format': 'nwb',
        'data': {
            'path': uri
        }
    })
    sorting = le.LabboxEphysSortingExtractor({
        'sorting_format': 'nwb',
        'data': {
            'path': uri
        }
    })

    recording_label = 'senor_test_R'
    sorting_label = 'senor_test_S'

    R_id = workspace.add_recording(recording=recording, label=recording_label)
    S_id = workspace.add_sorting(sorting=sorting, recording_id=R_id, label=sorting_label)


if __name__ == '__main__':
    main()