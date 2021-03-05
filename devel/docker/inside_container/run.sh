# This file was automatically generated. Do not edit directly. See devel/templates.

#!/bin/sh

set -ex

mkdir -p $KACHERY_STORAGE_DIR
export PYTHONUNBUFFERED=1

npm config set unsafe-perm true

pip list

exec labbox-ephys-services --api-websocket --api-http --client-prod --kachery-daemon-run-opts "$KACHERY_DAEMON_RUN_OPTS"