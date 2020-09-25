
import hither as hi
import labbox_ephys as le
import kachery_p2p as kp
import kachery as ka
import json

# recording_object = kp.load_object('sha1://e3f764b72eafa0704cb4fef23d101e10e5404043/allen_mouse419112_probeE-ch0-7-10sec.json')
recording_object = kp.load_object('sha1://8b222e25bc4d9c792e4490ca322b5338e0795596/cortexlab-single-phase-3.json')
recording_object = dict(
    recording_format='subrecording',
    data=dict(
        recording=recording_object,
        start_frame=0,
        end_frame=30000*60*10,
        channel_ids=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    )
)

# jc = hi.JobCache(use_tempdir=True)
jc = None
with hi.RemoteJobHandler(
    # substitute your own compute resource URI here
    compute_resource_uri='feed://09b27ce6c71add9fe6effaf351fce98d867d6fa002333a8b06565b0a108fb0ba?name=ephys1'
    # compute_resource_uri='feed://644c145d5f6088623ee59f3437655e185657a6d9a9676294f26ae504423565fa?name=lke9849-12258-5f50fc6bb944 '
) as jh:
    with hi.Config(
        container=True,
        job_cache=jc,
        job_handler=jh,
        required_files=recording_object
    ):
        x = le.sorters.mountainsort4.run(
            recording_object=recording_object
        ).wait()
        sorting_object = x['sorting_object']

le_recordings = []
le_sortings = []
le_curation_actions = []
le_recordings.append(dict(
    recordingId='test-recording-1',
    recordingLabel='test-recording-1',
    recordingPath=ka.store_object(recording_object, basename='test-recording-1.json'),
    recordingObject=recording_object,
    description='''
    A test recording
    '''.strip()
))
le_sortings.append(dict(
    sortingId='test-recording-1:mountainsort4',
    sortingLabel='test-recording-1:mountainsort4',
    sortingPath=ka.store_object(sorting_object, basename='test-recording-1-mountainsort4.json'),
    sortingObject=sorting_object,

    recordingId='test-recording-1',
    recordingPath=ka.store_object(recording_object, basename='test-recording-1.json'),
    recordingObject=recording_object,

    description='''
    MountainSort4 applied to test recording
    '''.strip()
))

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
    for action in le_curation_actions:
        sortings.append_message(dict(
            action=action
        ))
    x = f.create_snapshot([
        dict(documentId='default', key='recordings'),
        dict(documentId='default', key='sortings')
    ])
    print('Feed:')
    print(x.get_uri())
    print(f'http://ephys1.laboratorybox.org/default?feed={x.get_uri()}')
finally:
    f.delete()