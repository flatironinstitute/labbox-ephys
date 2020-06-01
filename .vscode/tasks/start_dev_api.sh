#!/bin/bash

set -ex

export EVENT_STREAM_URL=http://localhost:15353

cd api
python -m flask run -p 15352 --no-debugger