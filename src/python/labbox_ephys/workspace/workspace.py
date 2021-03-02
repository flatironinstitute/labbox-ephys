from typing import Union
import uuid
import kachery_p2p as kp
import spikeextractors as se

class Workspace:
    def __init__(self, *, feed: Union[kp.Feed, None], workspace_name: str) -> None:
        if feed is None:
            feed = kp.load_feed('labbox-ephys-default')
        self._feed = feed
        self._workspace_name = workspace_name
        workspace_subfeed = self._feed.get_subfeed(dict(workspaceName=self._workspace_name))
        self._recordings = _get_recordings_from_subfeed(workspace_subfeed)
        self._sortings = _get_sortings_from_subfeed(workspace_subfeed)
    def get_feed_uri(self):
        return self._feed.get_uri()
    def get_workspace_name(self):
        return self._workspace_name
    def add_recording(self, *, label: str, recording: se.RecordingExtractor):
        recording_id = 'R-' + _random_id()
        if recording_id in self._recordings:
            raise Exception(f'Duplicate recording ID: {recording_id}')
        x = {
            'recordingId': recording_id,
            'recordingLabel': label,
            'recordingPath': kp.store_object(recording.object(), basename=f'{label}.json'),
            'recordingObject': recording.object(),
            'description': f'Imported from Python: {label}'
        }
        workspace_subfeed = self._feed.get_subfeed(dict(workspaceName=self._workspace_name))
        _import_le_recording(workspace_subfeed, x)
        self._recordings[recording_id] = x
        return recording_id
    def add_sorting(self, *, recording_id: str, label: str, sorting: se.SortingExtractor):
        sorting_id = 'S-' + _random_id()
        if recording_id not in self._recordings:
            raise Exception(f'Recording not found: {recording_id}')
        if sorting_id in self._sortings:
            raise Exception(f'Duplicate sorting ID: {sorting_id}')
        le_recording = self._recordings[recording_id]
        x = {
            'sortingId': sorting_id,
            'sortingLabel': label,
            'sortingPath': kp.store_object(sorting.object(), basename=f'{label}.json'),
            'sortingObject': sorting.object(),

            'recordingId': recording_id,
            'recordingPath': le_recording['recordingPath'],
            'recordingObject': le_recording['recordingObject'],

            'description': f'Imported from Python: {label}'
        }
        workspace_subfeed = self._feed.get_subfeed(dict(workspaceName=self._workspace_name))
        _import_le_sorting(workspace_subfeed, x)
        self._sortings[sorting_id] = x
        return x
    def delete_recording(self, recording_id: str):
        if recording_id not in self._recordings:
            raise Exception(f'Recording not found: {recording_id}')
        _delete_recording(feed=self._feed, workspace_name=self._workspace_name, recording_id=recording_id)
        del self._recordings[recording_id]
    def delete_sorting(self, sorting_id: str):
        if sorting_id not in self._sortings:
            raise Exception(f'Sorting not found: {sorting_id}')
        _delete_sorting(feed=self._feed, workspace_name=self._workspace_name, sorting_id=sorting_id)
        del self._sortings[sorting_id]
    def get_recording(self, recording_id: str):
        return self._recordings[recording_id]
    def get_sorting(self, sorting_id: str):
        return self._recordings[sorting_id]
    def get_recordings(self):
        return self._recordings
    def get_sortings(self):
        return self._sortings


def load_workspace(*, workspace_name: str='default', feed: kp.Feed=None):
    return Workspace(workspace_name=workspace_name, feed=feed)

def _random_id():
    return str(uuid.uuid4())[-12:]

def _get_recordings_from_subfeed(subfeed: kp.Subfeed):
    subfeed.set_position(0)
    le_recordings = {}
    while True:
        msg = subfeed.get_next_message(wait_msec=0)
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

def _get_sortings_from_subfeed(subfeed: kp.Subfeed):
    subfeed.set_position(0)
    le_sortings = {}
    while True:
        msg = subfeed.get_next_message(wait_msec=0)
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
            elif a.get('type', '') == 'DELETE_SORTINGS_FOR_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    sids = list(le_sortings.keys())
                    for sid in sids:
                        if le_sortings[sid]['recordingId'] == rid:
                            del le_sortings[sid]
    return le_sortings

def _import_le_recording(subfeed: kp.Subfeed, le_recording):
    le_recordings = _get_recordings_from_subfeed(subfeed)
    id = le_recording['recordingId']
    if id in le_recordings:
        print(f'Recording with ID {id} already exists. Not adding.')
        return
    print(f'Adding recording: {id}')
    subfeed.submit_message({
        'action': {
            'type': 'ADD_RECORDING',
            'recording': le_recording
        }
    })

def _import_le_sorting(subfeed: kp.Subfeed, le_sorting):
    le_sortings = _get_sortings_from_subfeed(subfeed)
    id = le_sorting["sortingId"]
    if id in le_sortings:
        print(f'Sorting with ID {id} already exists. Not adding.')
        return
    print(f'Adding sorting: {id}')
    subfeed.submit_message({
        'action': {
            'type': 'ADD_SORTING',
            'sorting': le_sorting
        }
    })

def _delete_recording(*, feed: kp.Feed, workspace_name: str, recording_id: str):
    subfeed = feed.get_subfeed(dict(workspaceName=workspace_name))
    le_recordings = _get_recordings_from_subfeed(subfeed)
    if recording_id not in le_recordings:
        print(f'Cannot remove recording. Recording not found: {recording_id}')
    subfeed.append_message({
        'action': {
            'type': 'DELETE_RECORDINGS',
            'recordingIds': [recording_id]
        }
    })
    le_sortings = _get_sortings_from_subfeed(subfeed)
    sorting_ids_to_delete = []
    for k, v in le_sortings.items():
        if v.get('recordingId') == recording_id:
            sorting_ids_to_delete.append(v.get('sortingId'))
    if len(sorting_ids_to_delete) > 0:
        subfeed.append_message({
            'action': {
                'type': 'DELETE_SORTINGS',
                'sortingIds': sorting_ids_to_delete
            }
        })


def _delete_sorting(*, feed: kp.Feed, workspace_name: str, sorting_id: str):
    subfeed = feed.get_subfeed(dict(workspaceName=workspace_name))
    le_sortings = _get_recordings_from_subfeed(subfeed)
    if sorting_id not in le_sortings:
        print(f'Cannot remove sorting. Sorting not found: {sorting_id}')
    subfeed.append_message({
        'action': {
            'type': 'DELETE_SORTINGS',
            'sortingIds': [sorting_id]
        }
    })