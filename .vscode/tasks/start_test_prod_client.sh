#!/bin/bash

set -ex

yarn global add serve
$(yarn global bin)/serve -s build -l 15303