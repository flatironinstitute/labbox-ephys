#!/bin/bash

set -ex

# TODO: set kachery-p2p environment variables here

cd python/api

# gunicorn maybe has some advantages, but by default it only handles one request at a time
# pip install gunicorn
# ~/.local/bin/gunicorn -b 127.0.0.1:15362 api:app

# python -m flask run -p 15362 --no-debugger
python api.py