#!/bin/bash

set -ex

# if [ "$EUID" -ne 0 ]; then
#   # not running as root
#   sudo service nginx restart
# else
#   service nginx restart
# fi


# yarn global add serve
# yarn global add concurrently
# pip install gunicorn

# export PATH=$(yarn global bin):~/.local/bin:$PATH

if [ -n "$KACHERY_P2P_START_DAEMON_OPTS" ]; then

    export KACHERY_STORAGE_DIR=/data/kachery-storage
    mkdir -p $KACHERY_STORAGE_DIR

    export KACHERY_P2P_CONFIG_DIR=/data/kachery-p2p-config
    export KACHERY_P2P_API_PORT=15320
    mkdir -p $KACHERY_P2P_CONFIG_DIR

    kachery-p2p-start-daemon --method npm $KACHERY_P2P_START_DAEMON_OPTS &
fi

cd /labbox-ephys
# concurrently "cd /labbox-ephys && serve -s build -l 15306" "cd /labbox-ephys/api && gunicorn -b 127.0.0.1:15307 api:app"

serve -s build -l 15310 &

# The following is just to make sure the user is not confused by the message of the serve command
set +x
echo -e "\e[31mPlease wait...\e[39m"
sleep 1
echo -e "\e[31mPlease wait...\e[39m"
sleep 1
echo -e "\e[31mPlease wait...\e[39m"
sleep 1
echo -e "\e[31mPlease wait...\e[39m"
sleep 1
echo -e "\e[32m-----------------------------------------------------\e[39m"
echo -e "\e[32mServing labbox-ephys on port 15310\e[39m"
echo -e "\e[32mPoint your browser to \e[1mhttp://localhost:15310\e[21m\e[39m"
echo -e "\e[32m-----------------------------------------------------\e[39m"


cd /labbox-ephys/python/api
set -x

# gunicorn maybe has some advantages, but by default it only handles one request at a time
# exec gunicorn -b 127.0.0.1:15307 api:app

exec python -u api.py
