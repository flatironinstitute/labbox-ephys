#!/bin/bash

set -ex

cd api
python -m flask run -p 5020 --no-debugger