#!/bin/bash

set -ex

cd api
python -m flask run -p 15302 --no-debugger --without-threads