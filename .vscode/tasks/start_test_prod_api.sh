#!/bin/bash

set -ex

export EVENT_STREAM_URL=http://localhost:15363

pip install gunicorn
cd api
~/.local/bin/gunicorn -b 127.0.0.1:15362 api:app