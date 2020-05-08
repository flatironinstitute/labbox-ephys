# Labbox-ephys

Analysis and visualization of neurophysiology recordings and spike sorting results.

## Installation and basic usage

### Prerequisites

* Linux
* Docker
    - be sure that your non-root user is in the docker group
* Python (>= 3.6)
* git

### Create directories

You will need to create some directories. Rename as needed:

* `/home/user/labbox/kachery-storage` - The system will store large temporary files here
* `/home/user/labbox/data` - For importing data into the system
* `/home/user/labbox/compute-resource-server` (optional) - directory for hosting a compute resource server for spike sorting
* `/home/user/labbox/kachery-server` (optional) - directory for hosting a kachery server to go along with the compute resource server.

Set the `KACHERY_STORAGE_DIR` environment variable as the `kachery-storage` directory you are using.

### Install/upgrade labbox-launcher

```
pip install --upgrade git+git://github.com/laboratorybox/labbox-launcher
```

### Launch the container

Launch the labbox-ephys container and listen on port 15310 (or whatever you choose). Replace directories as appropriate.

```bash
labbox-launcher run magland/labbox-ephys:0.1.7-alpha.1 --kachery $KACHERY_STORAGE_DIR --data /home/user/labbox/data --port 15310
```

### View in browser

Now, point browser to: `http://localhost:15310`

Note that the console output of the labbox-launcher command may refer to other ports that are only relevant withint the container. You should the port specified via the `--port` option.

### Optionally host a compute resource server for spike sorting

To host a compute resource server, you must have three services running:

* A mongo database (either in the cloud or on your local machine)
* A kachery server (either locally or remotely)
* A hither compute resource server (either locally or remotely)

**To host a mongo database locally**

Install mongodb, and then run the following from a terminal:

```bash
mongod
```

This should start a Mongo database listening on the default port at `mongodb://localhost:27017`.

**To host a kachery server locally**

```bash
labbox-launcher run magland/kachery-server:0.1.0 --data /home/user/labbox/kachery-server --port 15401
```

If it doesn't already exists, a `kachery.json` file will be created in the `kachery-storage` directory. You can edit that to configure the server. Then restart the server with the above command.

Leave this server running in a terminal.

**To host a hither compute resource server locally**

Install the latest version of hither:

```
pip install --upgrade git+git://github.com/flatironinstitute/hither
```

First initialize the compute resource server via:

```bash
cd /home/user/labbox/compute-resource-server
hither-compute-resource init
```

This will create a `compute_resource.json`. You must edit that and fill in the relevant fields. For example, you must specify URLs for your mongo database and your kachery server.

For example,

* Mongo URL: `mongodb://localhost:27017`
* Database: `labbox` 
* Kachery URL: `http://localhost:15401`
* Kachery channel: `readwrite`
* Kachery password: `readwrite`

Then run the following to start the compute resource

```bash
cd /home/user/labbox/compute-resource-server
hither-compute-resource start
```

Leave this server running in a terminal.

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
* 0.1.7 [done]
    - Bokeh integration [done]
    - Matplotlib integration [done]
    - Prototypes view [done]
    - Summary plots of spike sorting
        - Autocorrelograms
* 
* 0.1.9
    - Import from local disk
* 0.1.10
    - Additional plots for 
* Other
    - when a recording is deleted, we must delete the associated sortings!
    - Store private job handler configuration on disk only (not in the redux state)
    - Import/export job handler configuration
    - Fix fetchSortingInfo and fetchRecordingInfo stuff
    - syncmark
    - Design a logo (replace logo.svg and public/favicon.ico)
    - More efficient serialization to disk
    - Export/import persisted state
