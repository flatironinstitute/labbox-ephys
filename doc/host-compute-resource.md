# Host a hither compute resource locally

These instructions show how to host a hither compute resource on your local computer. This can be used to run spike sorting when launched from the labbox-ephys GUI.

To host a compute resource server, you must have three services running:

* A mongo database (either in the cloud or on your local machine)
* A kachery server (either locally or remotely)
* A hither compute resource server (either locally or remotely)

![](./labbox-ephys-diagram.png)

Below we will assume you are running all of the services locally.

## Prerequisites

* Linux
* Docker
    - Be sure that your non-root user is in the docker group
    - Note that Singularity may be used instead (set HITHER_USE_SINGULARITY=TRUE)
* Python (>= 3.6)
* git

### Create directories

You will need to create some directories. Rename as needed:

* `/home/user/labbox/compute-resource-server` - directory for hosting a compute resource server for spike sorting
* `/home/user/labbox/mongo-data` - directory for hosting a mongo database for use with the compute resource server
* `/home/user/labbox/kachery-server` - directory for hosting a kachery server for use with the compute resource server.

Set environment variables to point to these directories so we can refer to them elsewhere

```bash
# Adjust as needed to match above
export COMPUTE_RESOURCE_SERVER_DIR=/home/user/labbox/compute-resource-server
export MONGO_DATA_DIR=/home/user/labbox/mongo-data
export KACHERY_SERVER_DIR=/home/user/labbox/kachery-server
```

To ensure that those environment variables are set with each new terminal session, add those lines to your ~/.bashrc file.

## Host a mongo database locally

```bash
docker run -v $MONGO_DATA_DIR:/data/db --net host -it mongo mongod --port 27017
```

This should start a Mongo database listening on the default port at `mongodb://localhost:27017`.

## Host a kachery server locally

```bash
labbox-launcher run magland/kachery-server:0.1.0 --data $KACHERY_SERVER_DIR --port 15401
```

If it doesn't already exists, a `kachery.json` file will be created in the `$KACHERY_SERVER_DIR` directory. You can edit that to configure the server. Then restart the server with the above command.

Leave this server running in a terminal.

## Host a hither compute resource server locally

Install the latest version of hither (it is recommended that you use a conda or virtualenv environment):

```
pip install --upgrade git+git://github.com/flatironinstitute/hither
```

First initialize the compute resource server via:

```bash
cd $COMPUTE_RESOURCE_SERVER_DIR
hither-compute-resource init
```

This will create a `compute_resource.json`. You must edit that and fill in the relevant fields. For example, you must specify URLs for your mongo database and your kachery server.

For example,

* Compute resource ID: `fill-in-a-unique-id`
* Mongo URL: `mongodb://localhost:27017`
* Database: `labbox` 
* Kachery URL: `http://localhost:15401`
* Kachery channel: `readwrite`
* Kachery password: `readwrite`

Then run the following to start the compute resource

```bash
cd $COMPUTE_RESOURCE_SERVER_DIR
hither-compute-resource start
```

Leave this server running in a terminal.

## Configure labbox-ephys to use the compute resource

You can now configure labbox-ephys to use your newly-configured hither compute
resource. From within the labbox-ephys browser gui click on the config button and add a new job handler of type "remote". Fill in the appropriate configuration information. Finally, use the
dropdown to specify to use this new job handler for spike sorting jobs.