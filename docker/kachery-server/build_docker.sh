#!/bin/bash

Rebuilds the docker image
If --push is provided, also pushes to dockerhub

set -ex

for i in "$@" ; do
    if [[ $i == "--push" ]] ; then
        PUSH="true"
    else
        PUSH="false"
    fi
done

IMAGE_NAME="magland/kachery-server:0.1.1"

docker build -t $IMAGE_NAME .

if [ "$PUSH" = "true" ]; then
    docker push $IMAGE_NAME
fi