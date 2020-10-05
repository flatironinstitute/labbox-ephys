import kachery as ka
import kachery_p2p as kp
import labbox_ephys as le


def main():
    snippets_h5_uri = 'sha1://55c0cb6a63231236b6948b0dd422e6fedc75c5b5/real_snippets.h5?manifest=b124474caccccdba135d9550ec544a88caf531aa'
    recording_obj = {
        'recording_format': 'snippets1',
        'data': {
            'snippets_h5_uri': snippets_h5_uri
        }
    }
    sorting_obj = {
        'sorting_format': 'snippets1',
        'data': {
            'snippets_h5_uri': snippets_h5_uri
        }
    }
    recording = le.LabboxEphysRecordingExtractor(recording_obj)
    sorting = le.LabboxEphysSortingExtractor(sorting_obj)
    print(recording.get_sampling_frequency())
    print(recording.get_channel_ids())

    le_recordings = []
    le_sortings = []

    le_recordings.append(dict(
        recordingId='loren_example1',
        recordingLabel='loren_example1',
        recordingPath=ka.store_object(recording_obj, basename='loren_example1.json'),
        recordingObject=recording_obj,
        description='''
        Example from Loren Frank
        '''.strip()
    ))
    le_sortings.append(dict(
        sortingId='loren_example1:mountainsort4',
        sortingLabel='loren_example1:mountainsort4',
        sortingPath=ka.store_object(sorting_obj, basename='loren_example-mountainsort4.json'),
        sortingObject=sorting_obj,

        recordingId='loren_example1',
        recordingPath=ka.store_object(recording_obj, basename='loren_example1.json'),
        recordingObject=recording_obj,

        description='''
        Example from Loren Frank (MountainSort4)
        '''.strip()
    ))

    feed_uri = create_labbox_ephys_feed(le_recordings, le_sortings)
    print(feed_uri)
    

def create_labbox_ephys_feed(le_recordings, le_sortings):
    try:
        f = kp.create_feed()
        recordings = f.get_subfeed(dict(documentId='default', key='recordings'))
        sortings = f.get_subfeed(dict(documentId='default', key='sortings'))
        for le_recording in le_recordings:
            recordings.append_message(dict(
                action=dict(
                    type='ADD_RECORDING',
                    recording=le_recording
                )
            ))
        for le_sorting in le_sortings:
            sortings.append_message(dict(
                action=dict(
                    type='ADD_SORTING',
                    sorting=le_sorting
                )
            ))
        # for action in le_curation_actions:
        #     sortings.append_message(dict(
        #         action=action
        #     ))
        x = f.create_snapshot([
            dict(documentId='default', key='recordings'),
            dict(documentId='default', key='sortings')
        ])
        return x.get_uri()
    finally:
        f.delete()

if __name__ == '__main__':
    main()
