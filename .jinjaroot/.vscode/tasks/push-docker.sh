#!/bin/bash

set -ex

docker push {{ dockerUser }}/{{ projectName }}:{{ projectVersion }}
