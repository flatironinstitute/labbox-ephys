<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
import uuid
=======
>>>>>>> import recordings view python scripts
import spikeextractors as se
import numpy as np
import labbox_ephys as le
import kachery_p2p as kp
import kachery as ka

def _get_recordings_from_subfeed(recordings_subfeed: kp.Subfeed):
    le_recordings = {}
    while True:
        msg = recordings_subfeed.get_next_message(wait_msec=0)
        if msg is None: break
        if 'action' in msg:
            a = msg['action']
            if a.get('type', '') == 'ADD_RECORDING':
                r = a.get('recording', {})
                rid = r.get('recordingId', '')
                le_recordings[rid] = r
            elif a.get('type', '') == 'DELETE_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    if rid in le_recordings:
                        del le_recordings[rid]
    return le_recordings

def _get_sortings_from_subfeed(sortings_subfeed: kp.Subfeed):
    le_sortings = {}
    while True:
        msg = sortings_subfeed.get_next_message(wait_msec=0)
        if msg is None: break
        if 'action' in msg:
            a = msg['action']
            if a.get('type', '') == 'ADD_SORTING':
                s = a.get('sorting', {})
                sid = s.get('sortingId', '')
                le_sortings[sid] = s
            elif a.get('type', '') == 'DELETE_SORTINGS':
                for sid in a.get('sortingIds', []):
                    if sid in le_sortings:
                        del le_sortings[sid]
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
            elif a.get('type', '') == 'DELETE_SORTINGS_FOR_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    sids = list(le_sortings.keys())
                    for sid in sids:
                        if le_sortings[sid]['recordingId'] == rid:
                            del le_sortings[sid]
=======
>>>>>>> import recordings view python scripts
    return le_sortings

def _import_le_recording(recordings_subfeed: kp.Subfeed, le_recording):
    recordings_subfeed.set_position(0)
    le_recordings = _get_recordings_from_subfeed(recordings_subfeed)
    id = le_recording['recordingId']
    if id in le_recordings:
        print(f'Recording with ID {id} already exists. Not adding.')
        return
    print(f'Adding recording: {id}')
    recordings_subfeed.submit_message({
        'action': {
            'type': 'ADD_RECORDING',
            'recording': le_recording
        }
    })

def _import_le_sorting(sortings_subfeed: kp.Subfeed, le_sorting):
    sortings_subfeed.set_position(0)
    le_sortings = _get_sortings_from_subfeed(sortings_subfeed)
    id = le_sorting["sortingId"]
    if id in le_sortings:
        print(f'Sorting with ID {id} already exists. Not adding.')
        return
    print(f'Adding sorting: {id}')
    sortings_subfeed.submit_message({
        'action': {
            'type': 'ADD_SORTING',
            'sorting': le_sorting
        }
    })

<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
def random_id():
    return str(uuid.uuid4())[-12:]

def import_recording(*, feed: kp.Feed, workspace_name: str, recording: se.RecordingExtractor, recording_label: str):
    recording_id = 'R-' + random_id()
    x = {
        'recordingId': recording_id,
        'recordingLabel': recording_label,
        'recordingPath': ka.store_object(recording.object(), basename=f'{recording_label}.json'),
        'recordingObject': recording.object(),
        'description': f'Imported from Python: {recording_label}'
    }
    recordings_subfeed = feed.get_subfeed(dict(workspaceName=workspace_name, key='recordings'))
    _import_le_recording(recordings_subfeed, x)
    return x

def import_sorting(*, feed: kp.Feed, workspace_name: str, recording: se.RecordingExtractor, sorting: se.SortingExtractor, recording_id: str, sorting_label: str):
    sorting_id = 'S-' + random_id()
    x = {
        'sortingId': sorting_id,
        'sortingLabel': sorting_label,
        'sortingPath': ka.store_object(sorting.object(), basename=f'{sorting_label}.json'),
=======
def import_recording(*, feed: kp.Feed, workspace_name: str, recording: se.RecordingExtractor, recording_id: str):
    x = {
        'recordingId': recording_id,
        'recordingLabel': recording_id,
        'recordingPath': ka.store_object(recording.object(), basename=f'{recording_id}.json'),
        'recordingObject': recording.object(),
        'description': f'Imported from Python: {recording_id}'
    }
    recordings_subfeed = feed.get_subfeed(dict(workspaceName=workspace_name, key='recordings'))
    _import_le_recording(recordings_subfeed, x)

def import_sorting(*, feed: kp.Feed, workspace_name: str, recording: se.RecordingExtractor, sorting: se.SortingExtractor, recording_id: str, sorting_id: str):
    x = {
        'sortingId': sorting_id,
        'sortingLabel': sorting_id,
        'sortingPath': ka.store_object(sorting.object(), basename=f'{sorting_id}.json'),
>>>>>>> import recordings view python scripts
        'sortingObject': sorting.object(),

        'recordingId': recording_id,
        'recordingPath': ka.store_object(recording.object(), basename=f'{recording_id}.json'),
        'recordingObject': recording.object(),

<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
        'description': f'Imported from Python: {sorting_label}'
    }
    sortings_subfeed = feed.get_subfeed(dict(workspaceName=workspace_name, key='sortings'))
    _import_le_sorting(sortings_subfeed, x)
    return x
=======
        'description': f'Imported from Python: {sorting_id}'
    }
    sortings_subfeed = feed.get_subfeed(dict(workspaceName=workspace_name, key='sortings'))
    _import_le_sorting(sortings_subfeed, x)
>>>>>>> import recordings view python scripts

def delete_recording(*, feed: kp.Feed, workspace_name: str, recording_id: str):
    recordings_subfeed = feed.get_subfeed(dict(workspaceName=workspace_name, key='recordings'))
    le_recordings = _get_recordings_from_subfeed(recordings_subfeed)
    if recording_id not in le_recordings:
        print(f'Cannot remove recording. Recording not found: {recording_id}')
    recordings_subfeed.append_message({
        'action': {
            'type': 'DELETE_RECORDINGS',
            'recordingIds': [recording_id]
        }
    })
    sortings_subfeed = feed.get_subfeed(dict(workspaceName=workspace_name, key='sortings'))
    le_sortings = _get_sortings_from_subfeed(sortings_subfeed)
    sorting_ids_to_delete = []
    for k, v in le_sortings.items():
        if v.get('recordingId') == recording_id:
            sorting_ids_to_delete.append(v.get('sortingId'))
    if len(sorting_ids_to_delete) > 0:
        sortings_subfeed.append_message({
            'action': {
                'type': 'DELETE_SORTINGS',
                'sortingIds': sorting_ids_to_delete
            }
        })


def delete_sorting(*, feed: kp.Feed, workspace_name: str, sorting_id: str):
    sortings_subfeed = feed.get_subfeed(dict(workspaceName=workspace_name, key='sortings'))
    le_sortings = _get_recordings_from_subfeed(sortings_subfeed)
    if sorting_id not in le_sortings:
        print(f'Cannot remove sorting. Sorting not found: {sorting_id}')
    sortings_subfeed.append_message({
        'action': {
            'type': 'DELETE_SORTINGS',
            'sortingIds': [sorting_id]
        }
    })