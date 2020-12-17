# Labbox-ephys development environment

These instructions will allow you to open labbox-ephys in a development environment.

## Prerequisites

* Linux
* [Visual studio code](https://code.visualstudio.com/) with the [Remote-Containers Extension](https://code.visualstudio.com/docs/remote/containers)
* Docker (be sure that your non-root user is in the docker group)

### Start kachery-p2p and set environment variables

Follow [these instructions](../README.md) to start a kachery-p2p daemon and set the following environment variables to the approprate values:

```
KACHERY_STORAGE_DIR
KACHERY_P2P_CONFIG_DIR
KACHERY_P2P_API_PORT
```

### Clone the source code

To use open labbox-ephys in a development environment, you should clone the source code of labbox-ephys, hither, kachery, and kachery-p2p:

```bash
# Adjust this source path as needed
cd /home/user/src
git clone https://github.com/laboratorybox/labbox-ephys labbox-ephys
git clone https://github.com/flatironinstitute/hither hither
git clone https://github.com/flatironinstitute/kachery kachery
git clone https://github.com/flatironinstitute/kachery-p2p kachery-p2p
```

Be sure that you are on the `new-protocol` branch of kachery-p2p (TODO: remove this line once new-protocol has been merged into master)

### Set environment variables for source code

Set the following environment variables (add these lines to ~/.bashrc so that they are set on each new login)


```bash
# Adjust the source paths to match above
export HITHER_SOURCE_DIR=/home/user/src/hither
export KACHERY_SOURCE_DIR=/home/user/src/kachery
export KACHERY_P2P_SOURCE_DIR=/home/user/src/kachery-p2p
```

### Open labbox-ephys in the development container

```bash
# Change to the labbox-ephys source directory and launch vscode
cd labbox-ephys
code .
```

Run the vscode command: `Remote-Containers: Reopen in Container`

If the .devcontainer configuration has changed, you may need to select the option to rebuild the container.

See [this guide](https://github.com/flatironinstitute/learn-sciware-dev/blob/master/07_RemoteWork/vscode/remote_containers.md) for more information on using devcontainers.

### Start the GUI development server

* Run the vscode task "yarn install" (only need to do this once unless dependency packages have been updated)
* Run the vscode task "START DEV"
* Open the browser pointing to the url in the terminal

You can learn more about vscode tasks [here](https://code.visualstudio.com/docs/editor/tasks). In short, to run a vscode task, select `Tasks: Run Task` from the Command Palette.

### Ports

**In development container**

The following ports are used by the development container:

* 15351 - development web server
* 15308 - development api websocket server (flask `api/`)

TODO: finish this list

**In deployed production container**

The following ports are used inside the deployed production container:

TODO: finish this list

### Deploying docker image

See [../docker/labbox-ephys](../docker/labbox-ephys)

### Jupyter Lab Widget Integration

Labbox-ephys Jupyter integration features are currently under development. We have implemented an extension system
which allows all UI elements (visualizations, etc) to be integrated into Jupyter notebooks. For
more information on how to run labbox in Jupyter, see
[the documentation on labbox_ephys_widgets_jp](labbox_ephys_widgets_jp.md).

Developers should be aware that some code duplication is required to facilitate consistent development of the
Jupyter versions. This is explained fully in [the documentation on the jupyterlab sync process](jupyterlab-sync.md).
