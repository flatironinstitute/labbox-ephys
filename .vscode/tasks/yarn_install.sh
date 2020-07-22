#!/bin/bash

set -ex

yarn install

# Need to install the required dependencies for kachery-p2p as well
cd /workspaces/kachery-p2p/daemon
npm install