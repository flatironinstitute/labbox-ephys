import spikeextractors as se
import numpy as np
import labbox_ephys as le
import kachery_p2p as kp
import kachery as ka


# Adjust these values
recording_label = 'despy_tet3'
sorting_label = 'sorting'
recording_nwb_path = '<path or URI of nwb recording>'
sorting_nwb_path = '<path or URI of nwb sorting>'
feed_uri = '{feedUri}'
workspace_name = 'default'


recording_uri = ka.store_object({
    'recording_format': 'nwb',
    'data': {
        'path': recording_nwb_path
    }
})
sorting_uri = ka.store_object({
    'sorting_format': 'nwb',
    'data': {
        'path': sorting_nwb_path
    }
})

sorting = le.LabboxEphysSortingExtractor(sorting_uri, samplerate=30000)
recording = le.LabboxEphysRecordingExtractor(recording_uri, download=True)

feed = kp.load_feed(feed_uri)
workspace = le.load_workspace(workspace_name=workspace_name, feed=feed)
print(f'Feed URI: {feed.get_uri()}')
R_id = workspace.add_recording(recording=recording, label=recording_label)
S_id = workspace.add_sorting(sorting=sorting, recording_id=R_id, label=sorting_label)