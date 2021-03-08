#!/bin/bash

set -ex

.vscode/tasks/yarn-build.sh

cd src/python
rm -rf dist
python setup.py sdist