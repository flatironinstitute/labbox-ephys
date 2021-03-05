#!/bin/bash

set -ex

.vscode/tasks/build-py-dist.sh

twine upload src/python/dist/*
