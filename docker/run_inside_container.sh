#!/bin/bash

set -ex

cd /labbox-ephys/api
python -m flask run -p 5020 --no-debugger &

cd /labbox-ephys
$(yarn global bin)/serve -s build -l $1
