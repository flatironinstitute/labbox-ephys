# This file was automatically generated. Do not edit directly. See devel/templates.

#!/bin/bash

set -ex

yarn install
yarn build
rm -rf src/python/labbox_ephys/build
cp -r build src/python/labbox_ephys/
