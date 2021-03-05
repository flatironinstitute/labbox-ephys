# This file was automatically generated. Do not edit directly. See devel/templates.

#!/bin/bash

set -ex

.vscode/tasks/yarn-build.sh

cd src/python
rm -rf dist
python setup.py sdist