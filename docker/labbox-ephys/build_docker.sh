#!/bin/bash

Rebuilds the app bundle
Builds the docker image for deploy using code in this repo
Uses the version from package.json as the tag
If --push is provided, also pushes to dockerhub

set -ex

for i in "$@" ; do
    if [[ $i == "--push" ]] ; then
        PUSH="true"
    else
        PUSH="false"
    fi
done

cd ../..

# Version key/value should be on its own line
# Thanks: https://gist.github.com/DarrenN/8c6a5b969481725a4413
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo "version from package.json is: ${PACKAGE_VERSION}"

rm -rf build
yarn build

IMAGE_NAME="magland/labbox-ephys:${PACKAGE_VERSION}"

docker build -f docker/labbox-ephys/Dockerfile -t $IMAGE_NAME .

if [ "$PUSH" = "true" ]; then
    docker push $IMAGE_NAME
fi