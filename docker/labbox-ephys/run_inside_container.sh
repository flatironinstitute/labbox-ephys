#!/bin/bash

set -ex

sudo service nginx restart

# yarn global add serve
# yarn global add concurrently
# pip install gunicorn

# export PATH=$(yarn global bin):~/.local/bin:$PATH

cd /labbox-ephys
# concurrently "cd /labbox-ephys && serve -s build -l 15306" "cd /labbox-ephys/api && gunicorn -b 127.0.0.1:15307 api:app"

serve -s build -l 15306 &

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


cd /labbox-ephys/api
set -x
exec gunicorn -b 127.0.0.1:15307 api:app