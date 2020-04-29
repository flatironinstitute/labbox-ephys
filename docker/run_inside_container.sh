#!/bin/bash

set -ex

PORT=$1

cd /labbox-ephys/api
python -m flask run -p $PORT --no-debugger
