#!/bin/sh

set -ex

[ ! -z "$KACHERY_DAEMON_RUN_OPTS" ] && mkdir -p $KACHERY_STORAGE_DIR
export PYTHONUNBUFFERED=1

npm config set unsafe-perm true

pip list

exec {{ projectName }}-services --api-websocket --api-http --client-prod --kachery-daemon-run-opts "$KACHERY_DAEMON_RUN_OPTS"