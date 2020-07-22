#!/bin/bash

set -ex

# TODO: set kachery-p2p environment variables here

kachery-p2p-start-daemon --method dev --verbose 200 --channel spikeforest
