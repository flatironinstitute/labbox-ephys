#!/bin/bash

set -ex

yarn install
yarn build
rm -rf src/python/labbox_ephys/build
cp -r build src/python/labbox_ephys/
