#!/bin/bash

set -ex

cd /labbox-ephys
$(yarn global bin)/serve -s build -l $1
