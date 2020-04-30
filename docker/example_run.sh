#!/bin/bash

PORT=3007

docker run \
    --net host \
    -e KACHERY_STORAGE_DIR=$KACHERY_STORAGE_DIR \
    -v $KACHERY_STORAGE_DIR:$KACHERY_STORAGE_DIR \
    -it magland/labbox-ephys:0.1.0 $PORT


