import os
from typing import Optional, List, Union
import json
import hashlib
import time
import urllib.request as request


class EventStreamClient:
    def __init__(self, url: str, channel: str, password: Union[dict, str]):
        self.url = url
        self.channel = channel
        self.password = password

    def get_stream(self, stream_id: Union[dict, str]):
        return _EventStream(stream_id=stream_id, client=self)


class _EventStream:
    def __init__(self, stream_id: Union[dict, str], client: EventStreamClient):
        self._url = client.url
        self._channel = client.channel
        self._password = client.password
        if isinstance(stream_id, str):
            self._stream_id = stream_id
        elif isinstance(stream_id, dict):
            self._stream_id = _sha1_of_object(stream_id)
        else:
            raise Exception(
                f'Unexpected type for stream_id: {type(stream_id)}')
        self._position = 0

    def set_position(self, position):
        self._position = position

    def read_events(self):
        signature = _sha1_of_object(dict(
            # keys in alphabetical order
            password=_get_password(self._password),
            streamId=self._stream_id,
            taskName='readEvents'
        ))
        url = f'''{self._url}/readEvents/{self._stream_id}/{self._position}?channel={self._channel}&signature={signature}'''
        result = _http_get_json(url)
        assert result is not None, f'Error loading json from: {url}'
        assert result.get('success', False), 'Error reading from event stream.'
        self._position = result['newPosition']
        return result['events']

    def write_event(self, event):
        self.write_events([event])

    def write_events(self, events):
        signature = _sha1_of_object(dict(
            # keys in alphabetical order
            password=_get_password(self._password),
            streamId=self._stream_id,
            taskName='writeEvents'
        ))
        url = f'''{self._url}/writeEvents/{self._stream_id}?channel={self._channel}&signature={signature}'''
        result = _http_post_json(url, dict(events=events))
        assert result is not None, f'Error loading json from: {url}'
        assert result.get('success', False), 'Error writing to event stream.'


def _get_password(x):
    if type(x) == str:
        return x
    elif type(x) == dict:
        if 'env' in x:
            env0 = x['env']
            if env0 in os.environ:
                return os.environ[env0]
            else:
                raise Exception(
                    'You need to set the {} environment variable'.format(env0))
        else:
            raise Exception('Unexpected password config')


def _sha1_of_string(txt: str) -> str:
    hh = hashlib.sha1(txt.encode('utf-8'))
    ret = hh.hexdigest()
    return ret


def _sha1_of_object(obj: object) -> str:
    txt = json.dumps(obj, sort_keys=True, separators=(',', ':'))
    return _sha1_of_string(txt)


def _http_get_json(url: str, use_cache_on_found: bool = False, verbose: Optional[bool] = False, retry_delays: Optional[List[float]] = None) -> dict:
    if use_cache_on_found:
        cache = getattr(_http_get_json, 'cache')
        if url in cache:
            return cache[url]
    timer = time.time()
    if retry_delays is None:
        retry_delays = [0.2, 0.5]
    if verbose is None:
        verbose = (os.environ.get('HTTP_VERBOSE', '') == 'TRUE')
    if verbose:
        print('_http_get_json::: ' + url)
    try:
        req = request.urlopen(url)
    except:
        if len(retry_delays) > 0:
            print('Retrying http request in {} sec: {}'.format(
                retry_delays[0], url))
            time.sleep(retry_delays[0])
            return _http_get_json(url, verbose=verbose, retry_delays=retry_delays[1:])
        else:
            return dict(success=False, error='Unable to open url: ' + url)
    try:
        ret = json.load(req)
    except:
        return dict(success=False, error='Unable to load json from url: ' + url)
    if verbose:
        print('Elapsed time for _http_get_json: {} {}'.format(
            time.time() - timer, url))
    elif use_cache_on_found:
        if ret['success'] and ret['found']:
            cache = getattr(_http_get_json, 'cache')
            cache[url] = ret
    return ret


def _http_post_json(url: str, data: dict, verbose: Optional[bool] = None) -> dict:
    timer = time.time()
    if verbose is None:
        verbose = (os.environ.get('HTTP_VERBOSE', '') == 'TRUE')
    if verbose:
        print('_http_post_json::: ' + url)
    try:
        import requests
    except:
        raise Exception('Error importing requests *')
    req = requests.post(url, json=data)
    if req.status_code != 200:
        return dict(
            success=False,
            error='Error posting json: {} {}'.format(
                req.status_code, req.content.decode('utf-8'))
        )
    if verbose:
        print('Elapsed time for _http_post_json: {}'.format(time.time() - timer))
    return json.loads(req.content)
