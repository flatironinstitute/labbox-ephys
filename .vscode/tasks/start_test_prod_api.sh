#!/bin/bash

set -ex

# TODO: set kachery-p2p environment variables here

pip install gunicorn
cd python/api
~/.local/bin/gunicorn -b 127.0.0.1:15362 api:app