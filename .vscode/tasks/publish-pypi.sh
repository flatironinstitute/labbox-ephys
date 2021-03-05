# This file was automatically generated. Do not edit directly. See devel/templates.

#!/bin/bash

set -ex

.vscode/tasks/build-py-dist.sh

twine upload src/python/dist/*
