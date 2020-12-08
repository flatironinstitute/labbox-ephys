# Labbox-ephys

**Under development** (and seeking helpers for this open source project)

Analysis and visualization of neurophysiology recordings and spike sorting results.

Experimental jupyterlab extension: [labbox_ephys_widgets_jp](doc/labbox_ephys_widgets_jp.md)

## Installation and basic usage

### Prerequisites

* Linux or MacOS
* Docker
    - For Linux, be sure that your non-root user is in the docker group
    - Recommended test from command line: `docker run hello-world`
* Python (>= 3.6)
* [kachery-p2p](https://github.com/flatironinstitute/kachery-p2p)
* git

### Start a kachery-p2p daemon

See [kachery-p2p](https://github.com/flatironinstitute/kachery-p2p) for details on running a kachery-p2p daemon on your local system.

### Set environment variables

Set the following environment variables

```bash
# KACHERY_STORAGE_DIR
# This should already be set if 
export KACHERY_STORAGE_DIR="<directory where kachery files will be stored>"

# KACHERY_P2P_CONFIG_DIR
# This should correspond to the config directory being used by the kachery-p2p daemon
# By default it is $HOME/.kachery-p2p
export KACHERY_P2P_CONFIG_DIR="<Config directory for kachery-p2p>"

# KACHERY_P2P_API_PORT
# This should correspond to the port being used by the kachery-p2p daemon
# By default it is 20431
export KACHERY_P2P_API_PORT="<Port number used by kachery-p2p daemon>"
```

Ensure that these environment variables are set with each new terminal session by adding those lines to your ~/.bashrc file.

### Install/upgrade labbox-launcher

Note: it is recommended that you use a [conda environment](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html) or a virtualenv when using the `pip` and `python` commands. If you create a conda environment you should target Python 3.7 with Numpy.

Install the latest version of labbox-launcher

```
pip install --upgrade git+git://github.com/laboratorybox/labbox-launcher
```

This should make the `labbox-launcher` command available from the command line. If it is not available, you may need to check that the appropriate bin directory for installed Python executables has been added to your PATH.

### Launch the container

Launch the labbox-ephys container

First double-check that docker is installed properly: `docker run hello-world`

Then:

```bash
# On Linux:
labbox-launcher run magland/labbox-ephys:0.4.3 --docker_run_opts "--net host" --kachery $KACHERY_STORAGE_DIR

# On MacOS:
labbox-launcher run magland/labbox-ephys:0.4.3 --docker_run_opts "-p 15310:15310 -p 15308:15308" --kachery $KACHERY_STORAGE_DIR
```

NOTE: If you have chosen to [run the `kachery-p2p` daemon on a non-standard
port](https://github.com/flatironinstitute/kachery-p2p/blob/main/doc/setup_and_installation.md#advanced-configuration), you will need to let the
labbox docker container know what port to communicate with.
Assuming `KACHERY_P2P_API_PORT` is set to the correct port for your daemon instance, you should then run a modified
version of the command that also passes this environment variable to the docker container:

```bash
# On Linux:
labbox-launcher run magland/labbox-ephys:0.4.3 --docker_run_opts "--net host -e KACHERY_P2P_API_PORT=$KACHERY_P2P_API_PORT" --kachery $KACHERY_STORAGE_DIR

# On MacOS:
labbox-launcher run magland/labbox-ephys:0.4.3 --docker_run_opts "-p 15310:15310 -p 15308:15308 -e KACHERY_P2P_API_PORT=$KACHERY_P2P_API_PORT" --kachery $KACHERY_STORAGE_DIR
```

### View in browser

Now, point your browser (chrome is recommended) to: `http://localhost:15310`

**Note: The terminal output may refer to different ports while starting up, but it is important that you use 15310**

### Optionally host a compute resource server for calculations

If you want to use your own computer to run calculations, then you will need to set up a hither compute resource server. Instructions for doing this will be provided later on.

## Information for developers

[Instructions on opening labbox-ephys in a development environment](doc/development-environment.md)

## Importing a recording and sorting

[See this example for franklab](https://gist.github.com/magland/e01d114cd8e54029dfc7402cf50ce0cf)

## Primary developers

Jeremy Magland and Jeff Soules

Center for Computational Mathematics, Flatiron Institute
