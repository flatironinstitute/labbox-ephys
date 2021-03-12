#!/bin/bash

set -ex

.vscode/tasks/yarn-build.sh

cd src/python
pip install -e .
