#!/bin/bash

set -ex

yarn install

# Need to install the required dependencies for eventstreamserver as well
cd /workspaces/hither/eventstreamserver
yarn install