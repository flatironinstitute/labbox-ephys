
import os
import sys
from aiohttp import web
import aiohttp_cors
import kachery as ka
thisdir = os.path.dirname(os.path.realpath(__file__))
os.environ['LABBOX_EPHYS_PYTHON_MODULE_DIR'] = f'{thisdir}/../labbox_ephys'

# # this is how the python functions in the extensions get registered
sys.path.insert(0, f'{thisdir}/../../src')
import extensions
extensions # just keep the linter happy - we only need to import extensions to register the hither functions
# remove the prepended path so we don't have side-effects
sys.path.remove(f'{thisdir}/../../src')

import random
import asyncio
import json
import sys
import time
import traceback
import urllib3
import yaml

import hither as hi
import kachery_p2p as kp
# this is how the hither functions get registered
import labbox_ephys as le
import websockets
from labbox_ephys.api._session import Session

def main():
    config_path_or_url = os.environ.get('LABBOX_EPHYS_CONFIG', None)
    if config_path_or_url is None:
        default_config_path = f'{thisdir}/../../labbox_config.yml'
        if os.path.exists(default_config_path):
            config_path_or_url = default_config_path
    print(f"LABBOX_EPHYS_CONFIG: {config_path_or_url}")
    if config_path_or_url:
        labbox_config = load_config(config_path_or_url)
    else:
        labbox_config = {
            'compute_resource_uri': '',
            'job_handlers': {
                'local': {
                    'type': 'local'
                },
                'partition1': {
                    'type': 'local'
                },
                'partition2': {
                    'type': 'local'
                },
                'partition3': {
                    'type': 'local'
                },
                'timeseries': {
                    'type': 'local'
                }
            },
            'nodes_with_access': [
            ]
        }

    print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    print(json.dumps(labbox_config, indent=4))
    print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

    nodes_with_access = labbox_config.get('nodes_with_access', [])
    while True:
        try:
            default_feed = kp.load_feed('labbox-ephys-default', create=True)
            break
        except:
            print('Unable to load feed. Perhaps daemon is not running yet. Trying again in a few seconds.')
            time.sleep(5)
    subfeed_names = [
        {'workspaceName': 'default', 'key': 'recordings'},
        {'workspaceName': 'default', 'key': 'sortings'}
    ]
    for sn in subfeed_names:
        sf = default_feed.get_subfeed(sn)
        sf.set_access_rules({
            'rules': [
                {
                    'nodeId': n['node_id'],
                    'write': True
                }
                for n in nodes_with_access
            ]
        })

    job_cache_path = os.environ['KACHERY_STORAGE_DIR'] + '/job-cache'
    if not os.path.exists(job_cache_path):
        os.mkdir(job_cache_path)

    async def incoming_message_handler(session, websocket):
        async for message in websocket:
            msg = json.loads(message)
            session.handle_message(msg)

    async def outgoing_message_handler(session, websocket):
        while True:
            try:
                hi.wait(0)
            except:
                traceback.print_exc()
            messages = session.check_for_outgoing_messages()
            if len(messages) > 0:
                await websocket.send(json.dumps(messages))
            if session.elapsed_sec_since_incoming_keepalive() > 60:
                print('Closing session')
                return
            await asyncio.sleep(0.05)

    # Thanks: https://websockets.readthedocs.io/en/stable/intro.html
    async def connection_handler(websocket, path):
        session = Session(
            labbox_config=labbox_config
        )
        task1 = asyncio.ensure_future(
            incoming_message_handler(session, websocket))
        task2 = asyncio.ensure_future(
            outgoing_message_handler(session, websocket))
        done, pending = await asyncio.wait(
            [task1, task2],
            return_when=asyncio.FIRST_COMPLETED,
        )
        print('Connection closed.')
        session.cleanup()
        for task in pending:
            task.cancel()

    start_server = websockets.serve(connection_handler, '0.0.0.0', 15308)

    asyncio.get_event_loop().run_until_complete(start_server)


    routes = web.RouteTableDef()

    async def sha1_handler(request):
        sha1 = str(request.rel_url).split('/')[2]
        uri = 'sha1://' + sha1
        txt = ka.load_text(uri)
        if txt is not None:
            return web.Response(text=txt)
        else:
            raise Exception(f'Not found: {uri}')
    app = web.Application()
    cors = aiohttp_cors.setup(app, defaults={
            "*": aiohttp_cors.ResourceOptions(
                    allow_credentials=True,
                    expose_headers="*",
                    allow_headers="*",
                )
        })
    sha1_resource = cors.add(app.router.add_resource('/sha1/{sha1}'))
    sha1_route = cors.add(
        sha1_resource.add_route("GET", sha1_handler), {
            "http://client.example.org": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers=("X-Custom-Server-Header",),
                allow_headers=("X-Requested-With", "Content-Type"),
                max_age=3600,
            )
        })
    # app.add_routes(routes)
    web.run_app(app, port=15309)

    # asyncio.get_event_loop().run_forever()

def cache_bust(url):
    r = random_string(8)
    if '?' in url:
        return url + '&' + r
    else:
        return url + '?' + r

def random_string(num_chars: int) -> str:
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return ''.join(random.choice(chars) for _ in range(num_chars))

def load_config(config_path_or_url):
    if config_path_or_url.startswith('http://') or config_path_or_url.startswith('https://'):
        http = urllib3.PoolManager()
        x = http.request('GET', cache_bust(config_path_or_url)).data
        return yaml.safe_load(x)
    else:
        with open(config_path_or_url) as f:
            x = f.read()
            return yaml.safe_load(x)

if __name__ == '__main__':
    main()
