#!/bin/bash

set -ex

yarn install
yarn build
rm -rf src/python/{{ projectNameUnderscore }}/build
cp -r build src/python/{{ projectNameUnderscore }}/
