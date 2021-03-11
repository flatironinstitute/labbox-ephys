#!/bin/bash --login
set -e

echo "activating conda environment..."

# activate conda environment and let the following process take over
conda activate myenv
conda list
exec "$@"