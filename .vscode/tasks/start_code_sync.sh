#!/bin/bash

set -ex

echo "The code sync task has been run on this workspace" > jupyterlab/codesync.txt

# You must install unison and unison-fsmonitor
# curl -L -o unison-fsmonitor https://github.com/TentativeConvert/Syndicator/raw/master/unison-binaries/unison-fsmonitor

E1=src/extensions
E2=jupyterlab/labbox_ephys_widgets_jp/src/extensions

[[ ! -d $E2 ]] && cp -r $E1 $E2

unison $E1 $E2 -ignore "Name __pycache__" -repeat watch
