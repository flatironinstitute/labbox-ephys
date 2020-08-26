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
pluginComponents # just keep the linter happy - we only need to import pluginComponents to register the hither functions

print(f"LABBOX_EPHYS_DEPLOY: {os.environ.get('LABBOX_EPHYS_DEPLOY')}")

# todo: manage this with configuration feeds
if os.environ.get('LABBOX_EPHYS_DEPLOY') == 'ephys1':
    crfeed_uri = 'feed://09b27ce6c71add9fe6effaf351fce98d867d6fa002333a8b06565b0a108fb0ba?name=ephys1'
    labbox_config = {
        'job_handlers': {
            'default': {
                'type': 'local'
            },
            'partition1': {
                'type': 'remote',
                'uri': crfeed_uri,
                'cr_paritition': 'partition1'
            },
            'partition2': {
                'type': 'remote',
                'uri': crfeed_uri,
                'cr_paritition': 'partition2'
            },
            'partition3': {
                'type': 'remote',
                'uri': crfeed_uri,
                'cr_paritition': 'partition3'
            },
            'timeseries': {
                'type': 'local'
            }
        }
    }
elif os.environ.get('LABBOX_EPHYS_DEPLOY') == 'dubb':
    crfeed_uri = 'feed://4dd6d6aa9e1d7be35e7374e6b35315bffefcfec27a9af36fa2e30bfd6753c5dc?name=dubb'
    labbox_config = {
        'job_handlers': {
            'default': {
                'type': 'local'
            },
            'partition1': {
                'type': 'remote',
                'uri': crfeed_uri,
                'cr_paritition': 'partition1'
            },
            'partition2': {
                'type': 'remote',
                'uri': crfeed_uri,
                'cr_paritition': 'partition2'
            },
            'partition3': {
                'type': 'remote',
                'uri': crfeed_uri,
                'cr_paritition': 'partition3'
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
        }
    }

local_job_handlers = dict(
    default=hi.ParallelJobHandler(4),
    partition1=hi.ParallelJobHandler(4),
    partition2=hi.ParallelJobHandler(4),
    partition3=hi.ParallelJobHandler(4),
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