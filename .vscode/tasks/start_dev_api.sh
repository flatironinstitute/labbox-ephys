#!/bin/bash

set -ex

# TODO: set kachery-p2p environment variables here

export LABBOX_EPHYS_PYTHON_MODULE_DIR=$PWD/python/labbox_ephys
export LABBOX_EXTENSIONS_DIR=$PWD/src/extensions
export LABBOX_WEBSOCKET_PORT=15308
export LABBOX_HTTP_PORT=15309
labbox_api