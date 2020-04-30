#!/bin/bash

set -ex

pip install gunicorn
cd api
~/.local/bin/gunicorn -b 127.0.0.1:15304 api:app