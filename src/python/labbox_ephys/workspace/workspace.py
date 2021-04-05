from typing import List, Union
import uuid
import kachery_p2p as kp
from numpy import intersect1d, number, unique
import spikeextractors as se
from ..extractors import LabboxEphysRecordingExtractor, LabboxEphysSortingExtractor

def parse_workspace_uri(workspace_uri: str):
    if not workspace_uri.startswith('workspace://'):
        raise Exception(f'Invalid workspace uri: {workspace_uri}')
    a = workspace_uri.split('/')
    return a[2], a[3]

class Workspace:
    def __init__(self, *, workspace_uri: str) -> None:
        if not workspace_uri.startswith('workspace://'):
            default_feed = kp.load_feed('labbox-ephys-default', create=True)
            workspace_uri = f'workspace://{default_feed.get_feed_id()}/{workspace_uri}'
        self._workspace_uri = workspace_uri
        feed_id, workspace_name = parse_workspace_uri(self._workspace_uri)
        self._feed = kp.load_feed(f'feed://{feed_id}')
        self._workspace_name = workspace_name
        workspace_subfeed = self._feed.get_subfeed(dict(workspaceName=self._workspace_name))
        self._recordings = _get_recordings_from_subfeed(workspace_subfeed)
        self._sortings = _get_sortings_from_subfeed(workspace_subfeed)
        self._unit_metrics_for_sortings = _get_unit_metrics_for_sortings_from_subfeed(workspace_subfeed)
    def get_uri(self):
        return self._workspace_uri
    def get_feed_uri(self):
        return self._feed.get_uri()
    def get_workspace_name(self):
        return self._workspace_name
    def add_recording(self, *, label: str, recording: LabboxEphysRecordingExtractor):
        recording_id = 'R-' + _random_id()
        if recording_id in self._recordings:
            raise Exception(f'Duplicate recording ID: {recording_id}')
        x = {
            'recordingId': recording_id,
            'recordingLabel': label,
            'recordingPath': kp.store_json(recording.object(), basename=f'{label}.json'),
            'recordingObject': recording.object(),
            'description': f'Imported from Python: {label}'
        }
        workspace_subfeed = self._feed.get_subfeed(dict(workspaceName=self._workspace_name))
        _import_le_recording(workspace_subfeed, x)
        self._recordings[recording_id] = x
        return recording_id
    def add_sorting(self, *, recording_id: str, label: str, sorting: LabboxEphysSortingExtractor):
        sorting_id = 'S-' + _random_id()
        if recording_id not in self._recordings:
            raise Exception(f'Recording not found: {recording_id}')
        if sorting_id in self._sortings:
            raise Exception(f'Duplicate sorting ID: {sorting_id}')
        le_recording = self._recordings[recording_id]
        x = {
            'sortingId': sorting_id,
            'sortingLabel': label,
            'sortingPath': kp.store_json(sorting.object(), basename=f'{label}.json'),
            'sortingObject': sorting.object(),

            'recordingId': recording_id,
            'recordingPath': le_recording['recordingPath'],
            'recordingObject': le_recording['recordingObject'],

            'description': f'Imported from Python: {label}'
        }
        workspace_subfeed = self._feed.get_subfeed(dict(workspaceName=self._workspace_name))
        _import_le_sorting(workspace_subfeed, x)
        self._sortings[sorting_id] = x
        return sorting_id
    def set_unit_metrics_for_sorting(self, *, sorting_id: str, metrics: List[dict]):
        metrics_uri = kp.store_json(metrics, basename='unit_metrics.json')
        x = {
            'sortingId': sorting_id,
            'metricsUri': metrics_uri
        }
        workspace_subfeed = self._feed.get_subfeed(dict(workspaceName=self._workspace_name))
        _set_unit_metrics_for_sorting(workspace_subfeed, x)
        self._unit_metrics_for_sortings[sorting_id] = metrics
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
        return self._sortings[sorting_id]
    def get_recording_ids(self):
        return list(self._recordings.keys())
    def get_sorting_ids(self):
        return list(self._sortings.keys())
    def get_sorting_ids_for_recording(self, recording_id: str):
        return [sid for sid in self.get_sorting_ids() if self.get_sorting(sid)['recordingId'] == recording_id]
    def get_recording_extractor(self, recording_id):
        r = self.get_recording(recording_id)
        return LabboxEphysRecordingExtractor(r['recordingObject'])
    def get_sorting_extractor(self, sorting_id):
        s = self.get_sorting(sorting_id)
        return LabboxEphysSortingExtractor(s['sortingObject'])
    def get_sorting_curation(self, sorting_id: str):
        workspace_subfeed = self._feed.get_subfeed(dict(workspaceName=self._workspace_name))
        return _get_sorting_curation(workspace_subfeed, sorting_id=sorting_id)
    def get_curated_sorting_extractor(self, sorting_id):
        s = self.get_sorting(sorting_id)
        sc = self.get_sorting_curation(sorting_id)
        return LabboxEphysSortingExtractor({
            'sorting_format': 'curated',
            'data': {
                'sorting': s['sortingObject'],
                'merge_groups': sc.get('mergeGroups', [])
            }
        })


def load_workspace(workspace_uri: str='default'):
    return Workspace(workspace_uri=workspace_uri)

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
            elif a.get('type', '') == 'DELETE_RECORDINGS':
                for rid in a.get('recordingIds', []):
                    sids = list(le_sortings.keys())
                    for sid in sids:
                        if le_sortings[sid]['recordingId'] == rid:
                            del le_sortings[sid]
    return le_sortings

def _get_unit_metrics_for_sortings_from_subfeed(subfeed: kp.Subfeed):
    subfeed.set_position(0)
    sortings = _get_sortings_from_subfeed(subfeed)
    le_unit_metrics_for_sortings = {}
    while True:
        msg = subfeed.get_next_message(wait_msec=0)
        if msg is None: break
        if 'action' in msg:
            a = msg['action']
            if a.get('type', '') == 'SET_UNIT_METRICS_FOR_SORTING':
                x = a.get('unitMetricsForSorting', {})
                sid = x.get('sortingId', '')
                uri = x.get('metricsUri')
                if sid in sortings:
                    le_unit_metrics_for_sortings[sid] = kp.load_json(uri)
    return le_unit_metrics_for_sortings

def _mg_intersection(g1: List[number], g2: List[number]):
    return [x for x in g1 if x in g2]

def _mg_union(g1: List[number], g2: List[number]):
    return sorted(list(set(g1 + g2)))

def _simplify_merge_groups(merge_groups: List[List[number]]):
    new_merge_groups = [[x for x in g] for g in merge_groups] # make a copy
    something_changed = True
    while something_changed:
        something_changed = False
        for i in range(len(new_merge_groups)):
            g1 = new_merge_groups[i]
            for j in range(i + 1, len(new_merge_groups)):
                g2 = new_merge_groups[j]
                if len(_mg_intersection(g1, g2)) > 0:
                    new_merge_groups[i] = _mg_union(g1, g2)
                    new_merge_groups[j] = []
                    something_changed = True
    return [sorted(mg) for mg in new_merge_groups if len(mg) >= 2]

def _get_sorting_curation(subfeed: kp.Subfeed, sorting_id: str):
    subfeed.set_position(0)
    labels_by_unit = {}
    merge_groups = []
    while True:
        msg = subfeed.get_next_message(wait_msec=0)
        if msg is None: break
        if 'action' in msg:
            a = msg['action']
            if a.get('type', '') == 'ADD_UNIT_LABEL':
                unit_id = a.get('unitId', '')
                label = a.get('label', '')
                if unit_id not in labels_by_unit:
                    labels_by_unit[unit_id] = []
                labels_by_unit[unit_id].append(label)
                labels_by_unit[unit_id] = sorted(list(set(labels_by_unit[unit_id])))
            elif a.get('type', '') == 'REMOVE_UNIT_LABEL':
                unit_id = a.get('unitId', '')
                label = a.get('label', '')
                if unit_id in labels_by_unit:
                    labels_by_unit[unit_id] = [x for x in labels_by_unit[unit_id] if x != label]
            elif a.get('type', 'MERGE_UNITS'):
                unit_ids = a.get('unitIds', [])
                merge_groups = _simplify_merge_groups(merge_groups + [unit_ids])
            elif a.get('type', 'UNMERGE_UNITS'):
                unit_ids = a.get('unitIds', [])
                merge_groups = _simplify_merge_groups([[u for u in mg if (u not in unit_ids)] for mg in merge_groups])
    return {
        'labelsByUnit': labels_by_unit,
        'mergeGroups': merge_groups
    }

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

def _set_unit_metrics_for_sorting(subfeed: kp.Subfeed, le_unit_metrics_for_sorting):
    sid = le_unit_metrics_for_sorting['sortingId']
    print(f'Setting unit metrics for sorting {sid}')
    subfeed.submit_message({
        'action': {
            'type': 'SET_UNIT_METRICS_FOR_SORTING',
            'unitMetricsForSorting': le_unit_metrics_for_sorting
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