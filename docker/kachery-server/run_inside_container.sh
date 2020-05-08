#!/bin/bash

set -ex

if [ ! -f "/data/kachery.json" ]; then
    echo "File /data/kachery.json does not exist. Copying template file."
    cp /kachery_config_template.json /data/kachery.json
fi

PORT=8080 KACHERY_STORAGE_DIR=/data npm start