#!/bin/bash

docker run -e KACHERY_DAEMON_RUN_OPTS="--label {{ projectName }}-1" -e KACHERY_STORAGE_DIR="/kachery-storage" --net host -it {{ dockerUser }}/{{ projectName }}:{{ projectVersion }}