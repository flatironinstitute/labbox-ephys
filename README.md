# Labbox-ephys

Analysis and visualization of neurophysiology recordings and spike sorting results.

## Installation

**Prerequisites:**

* Linux
* Docker
    - be sure that your non-root user is in the docker group
* Python (>= 3.6)
* git

**Installation:**

```
pip install --upgrade git+git://github.com/laboratorybox/labbox-launcher
```

**Launch the container**

```bash
# Launch the labbox-ephys container and listen on port 15310 (or whatever you choose)
# replace /some/data/dir by an existing directory on your machine
labbox-launcher run magland/labbox-ephys:0.1.7-alpha.1 --data /some/data/dir --port 15310
```

**View in browser**

Now, point browser to: `http://localhost:15310`

Note that the console output of the labbox-launcher command may refer to other ports that are only relevant withint the container. You should the port specified via the `--port` option.

## Information for developers

### Ports

In development container:

* 15301 - development client (yarn start)
* 15302 - development api server (flask `api/`)
* 15303 - test production client (serving `build/` directory)
* 15304 - test production api server (gunicorn flask `api/`)
* 15305 - test production nginx server

In deployed production container:

* 15306 - client (serving `build/` directory)
* 15307 - server (gunicorn flask `api/`)
* 8080 - nginx server

### Deploying docker image

See [docker/build_docker.sh](docker/build_docker.sh)

### Todo

* 0.1.3 [done]
    - Import sortings
        - Start with ground truth from SpikeForest
* 0.1.4 [done]
    - labbox-launcher: implement --data
    - Persist data to disk (not in browser)
* 0.1.5 [done]
    - Python script for building/pushing docker images
    - Minimize size of new docker layers for deploys
        - should be just a few MB
        - build app bundle outside of container
        - parse version from package.json
    - Timeseries view for recordings
* 0.1.6 [done]
    - Code cleanup - separate out ephys-specific code
    - Reorganize python files
    - Improve mechanism for job submission from javascript to python
    - Configure job handlers from GUI
    - Run spike sorting
    - View sortings
    - Read version from package.json to determine tag
    - Refactor sortingInfo calculation
    - Select compute resource for spike sorting and other stuff
    - refactoring to remove fetchRecordingInfo and fetchSortingInfo
* 0.1.7 [in progress]
    - Bokeh integration [done]
    - Matplotlib integration [done]
    - Prototypes view
    - Summary plots of spike sorting
        - Autocorrelograms
        - Average waveforms
* 0.1.8
    -Import from local disk
* Other
    - when a recording is deleted, we must delete the associated sortings!
    - Store private job handler configuration on disk only (not in the redux state)
    - Import/export job handler configuration
    - Fix fetchSortingInfo and fetchRecordingInfo stuff
    - sourcemark
    - Design a logo (replace logo.svg and public/favicon.ico)
    - More efficient serialization to disk
    - Export/import persisted state
