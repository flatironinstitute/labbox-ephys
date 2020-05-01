# Labbox-ephys

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

### Todo

* 0.1.3 [done]
    - Import sortings
        - Start with ground truth from SpikeForest
* 0.1.4
    - labbox-launcher: implement --tmp --data
    - Persist data to disk (not in browser)
* 0.1.5
    - Timeseries view for recordings
* 0.1.6
    - Run spike sorting
* 0.1.7
    - Select compute resource for spike sorting
* 0.1.8
    - Summary plots of spike sorting
* 0.1.9
    -Import from local disk

* Other
    - Python script for building/pushing docker images
    - Read version from package.json to determine tag
