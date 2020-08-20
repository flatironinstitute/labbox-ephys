import json
import os
import sys
import traceback
import hither as hi
import asyncio
import websockets
from labbox_ephys.api._session import Session


# this is how the hither functions get registered
import labbox_ephys as le
thisdir = os.path.dirname(os.path.realpath(__file__))
sys.path.append(f'{thisdir}/../../src')
import pluginComponents
pluginComponents

# todo: manage this with configuration feeds
if os.environ.get('LABBOX_EPHYS_DEPLOY') == 'ephys1':
    labbox_config = {
        'job_handlers': {
            'default': {
                'type': 'local'
            },
            'calculation1': {
                'type': 'remote',
                'uri': 'feed://fae110e69522c5d5605b2b3e149b62311b0ec3e682a04498f65c9f6da23f0977?name=ccmlin008-ephys1-1'
            },
            'calculation2': {
                'type': 'remote',
                'uri': 'feed://9f0a732a660ff9cb29d7f6e3f4e7fbf43392ba569058df83ae807d200e79117f?name=ccmlin008-ephys1-2'
            },
            'calculation3': {
                'type': 'remote',
                'uri': 'feed://96b4879d17c55fdd414b1f03e52d9c54c16467488ff42adabedb3c9386ee5397?name=ccmlin008-ephys1-3'
            },
            'timeseries': {
                'type': 'local'
            }
        }
    }
else:
    labbox_config = {
        'job_handlers': {
            'default': {
                'type': 'local'
            },
            'calculation1': {
                'type': 'local'
            },
            'calculation2': {
                'type': 'local'
            },
            'calculation3': {
                'type': 'local'
            },
            'timeseries': {
                'type': 'local'
            }
        }
    }

local_job_handlers = dict(
    default=hi.ParallelJobHandler(4),
    calculation1=hi.ParallelJobHandler(4),
    calculation2=hi.ParallelJobHandler(4),
    calculation3=hi.ParallelJobHandler(4),
    timeseries=hi.ParallelJobHandler(4)
)

# default_job_cache=hi.JobCache(use_tempdir=True)
job_cache_path = os.environ['KACHERY_STORAGE_DIR'] + '/job-cache'
if not os.path.exists(job_cache_path):
    os.mkdir(job_cache_path)
default_job_cache=hi.JobCache(path=job_cache_path)

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
        for message in messages:
            await websocket.send(json.dumps(message))
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
asyncio.get_event_loop().run_forever()