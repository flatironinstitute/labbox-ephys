#!/bin/bash

set -ex

sudo service nginx restart

# yarn global add serve
# yarn global add concurrently
# pip install gunicorn

# export PATH=$(yarn global bin):~/.local/bin:$PATH

cd /labbox-ephys
concurrently "cd /labbox-ephys && serve -s build -l 15306" "cd /labbox-ephys/api && gunicorn -b 127.0.0.1:15307 api:app"
