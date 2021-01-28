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
feed_name = 'labbox-ephys-default'
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

feed = kp.load_feed(feed_name, create=True)
print(f'Feed URI: {feed.get_uri()}')
R = le.import_recording(feed=feed, workspace_name=workspace_name, recording=recording, recording_label=recording_label)
S = le.import_sorting(feed=feed, workspace_name=workspace_name, recording=recording, sorting=sorting, recording_id=R['recordingId'], sorting_label=sorting_label)
