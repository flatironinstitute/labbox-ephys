#!/bin/bash

set -ex

export PORT=15353
export EVENT_STREAM_SERVER_DIR=/workspaces/labbox-ephys/data/eventstreamdata
export EVENT_STREAM_WEBSOCKET_URL=ws://localhost:${PORT}
mkdir -p $EVENT_STREAM_SERVER_DIR
cp /workspaces/hither/eventstreamserver/eventstreamserver_open.json $EVENT_STREAM_SERVER_DIR/eventstreamserver.json
node --experimental-modules /workspaces/hither/eventstreamserver/server/main.js

