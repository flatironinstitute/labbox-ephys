#!/bin/sh
# This file was automatically generated by jinjaroot. Do not edit directly. See the .jinjaroot dir.


set -ex

mkdir -p $KACHERY_STORAGE_DIR
export PYTHONUNBUFFERED=1

npm config set unsafe-perm true

pip list

exec labbox-ephys-services --api-websocket --api-http --client-prod --kachery-daemon-run-opts "$KACHERY_DAEMON_RUN_OPTS"