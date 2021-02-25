#!/bin/bash

set -ex

exec .vscode/tasks/yarn-build.sh

cd src/python
rm -r dist
python setup.py sdist
twine upload dist/*
