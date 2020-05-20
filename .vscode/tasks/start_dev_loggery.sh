#!/bin/bash

set -ex

cd loggery/server
yarn install

mkdir -p /data/loggery-server
cp example_loggery_open.json /data/loggery-server/loggery.json
PORT=15321 LOGGERY_SERVER_DIR=/data/loggery-server yarn start