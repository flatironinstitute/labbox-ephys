# Labbox-ephys

**Under development** (and seeking helpers for this open source project)

Analysis and visualization of neurophysiology recordings and spike sorting results.

## Installation and basic usage

### Prerequisites

* Linux or MacOS
* Docker
    - For Linux, be sure that your non-root user is in the docker group
    - Recommended test from command line: `docker run hello-world`
* Python (>= 3.6)
* git

### Create directories and set environment variables

You will need to create a data directory. You can choose any location you want, but on Linux this could look like the following (where `<user>` is the name of the logged-in user):

* `/home/<user>/labbox/labbox-ephys-data-dir`

Set an environment variable to point to this directory so we can refer to it elsewhere

```bash
# Adjust as needed to match above
export LABBOX_EPHYS_DATA_DIR=/home/user/labbox/labbox-ephys-data
```

Ensure that this environment variable is set with each new terminal session by adding that line to your ~/.bashrc file.

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
labbox-launcher run magland/labbox-ephys:0.3.14 --docker_run_opts "--net host" --data $LABBOX_EPHYS_DATA_DIR

# On MacOS:
labbox-launcher run magland/labbox-ephys:0.3.14 --docker_run_opts "-p 15310:15310 -p 15308:15308" --data $LABBOX_EPHYS_DATA_DIR
```

### View in browser

Now, point your browser (chrome is recommended) to: `http://localhost:15310`

**Note: The terminal output may refer to different ports while starting up, but it is important that you use 15310**

### Optionally host a compute resource server for spike sorting

If you want to use your own computer to run the spike sorting, then you will need to set up a hither compute resource server. Instructions for doing this can be found in the "Job handlers" section of the "Config" page in the GUI.

## Information for developers

[Instructions on opening labbox-ephys in a development environment](doc/development-environment.md)

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
        - Autocorrelograms [done]
* 0.1.8 [done-ish]
    - Update documentation - for users and developers
    - Create complete instructions for running labbox-ephys with local compute resource
* 0.1.9 [done]
    - reorganized labbox rec extractor [done]
    - switch to using recordingObject throughout [done]
    - switch to using sortingObject throughout #3 [done]
    - when recording is deleted, also delete the associated sortings #5 [done]
    - auto-convert sha1:// strings to hi.File() [done]
    - Import from local disk [done]
    - Persisting sorting jobs #6 [done]
    - Run multiple hither api calls in parallel #8 [done]
* 0.1.10 [done]
    - Hither job monitor within GUI #11 [done]
    - Improved import/download spikeforest recordings system [done]
    - Timestamps on jobs, sort table by timestamps [done]
    - Show error messages on job monitor [done]
    - Show console output on job monitor [done]
    - Allow cancelling of hither jobs [done]
* 0.1.11
    - Persist data using event stream [done]
    - Use new version of hither compute resource [done]
    - Improve import efficiency [done]
    - Switch to recordingLabel/sortingLabel instead of recordingId/sortingId [done]
    - Job handler config : use event stream [done]
    - Use hard linking for kachery storage [done]
    - Use kachery storage directory inside labbox ephys data directory [done]
    - Fix issue with switch back to NONE job handler for roles [done]
* 0.1.12
    - Import .nwb files [done]
    - Integration with franklab datajoint [***]
    - Connect back to sorting job even after page reload #9
    - Additional plots for sorting view
* Other
    - Store private job handler configuration on disk only (not in the redux state)
    - Import/export job handler configuration
    - Fix fetchSortingInfo and fetchRecordingInfo stuff
    - syncmark
    - Design a logo (replace logo.svg and public/favicon.ico)
    - More efficient serialization to disk
    - Export/import persisted state

## Authors

Jeremy Magland and Jeff Soules

Center for Computational Mathematics, Flatiron Institute
