# Labbox-ephys development environment

These instructions will allow you to open labbox-ephys in a development environment.

## Prerequisites

* Linux
* [Visual studio code](https://code.visualstudio.com/) with the [Remote-Containers Extension](https://code.visualstudio.com/docs/remote/containers)
* Docker (be sure that your non-root user is in the docker group)

### Clone the source code

To use open labbox-ephys in a development environment, you should clone the source code of labbox-ephys, hither, and kachery:

```bash
# Adjust this source path as needed
cd /home/user/src
git clone https://github.com/laboratorybox/labbox-ephys labbox-ephys
git clone https://github.com/flatironinstitute/kachery kachery
git clone https://github.com/flatironinstitute/hither hither
```

and be sure that the following environment variables are set
```bash
# Adjust the source path to match above
export HITHER_SOURCE_DIR=/home/user/src/hither
export KACHERY_SOURCE_DIR=/home/user/src/kachery
```

Also, make sure that the `KACHERY_STORAGE_DIR` environment variable is set as described in the main installation instructions.

### Open labbox-ephys in the development container

```bash
# Change to the labbox-ephys source directory and launch vscode
cd labbox-ephys
code .
```

Run the vscode command: `Remote-Containers: Reopen in Container`

See [this guide](https://github.com/flatironinstitute/learn-sciware-dev/blob/master/07_RemoteWork/vscode/remote_containers.md) for more information on using devcontainers.

### Start the GUI development server

* Run the vscode task "yarn install" (only need to do this once unless dependency packages have been updated)
* Run the vscode task "START DEV"
* Open the browser pointing to the url in the terminal

You can learn more about vscode tasks [here](https://code.visualstudio.com/docs/editor/tasks). In short, to run a vscode task, select `Tasks: Run Task` from the Command Palette.

### Ports

**In development container**

The following ports are used by the development container:

* 15351 - development client (yarn start)
* 15352 - development api server (flask `api/`)
* 15353 - development event stream server
* 15353 - development websocket for event stream server
* 15361 - test production client (serving `build/` directory)
* 15362 - test production api server (gunicorn flask `api/`)
* 15363 - test production event stream server
* 15363 - test production websocket for event stream server
* 15371 - test production nginx server

**In deployed production container**

The following ports are used inside the deployed production container:

* 15306 - client (serving `build/` directory)
* 15307 - server (gunicorn flask `api/`)
* 15308 - event stream server
* 15308 - websocket for event stream server
* 15310 - nginx server (main port to connect to)

### Deploying docker image

See [../docker/labbox-ephys](../docker/labbox-ephys)