#!/bin/bash

set -ex

service nginx restart

cd /labbox-ephys
$(yarn global bin)/serve -s build -l 15306 &

cd /labbox-ephys/api
gunicorn -b 127.0.0.1:15307 api:app
