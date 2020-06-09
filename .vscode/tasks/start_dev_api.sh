#!/bin/bash

set -ex

export EVENT_STREAM_URL=http://localhost:15353
export EVENT_STREAM_WEBSOCKET_PORT=15353

cd python/api
python -m flask run -p 15352 --no-debugger