#!/bin/bash
# This file was automatically generated by jinjaroot. Do not edit directly. See the .jinjaroot dir.


set -ex

.vscode/tasks/build-py-dist.sh

rm -rf devel/docker/dist
cp -r src/python/dist devel/docker/

cd devel/docker
docker build -t magland/labbox-ephys:0.6.1 .
