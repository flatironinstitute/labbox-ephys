# Compute resource configuration

|||
|---|---|
|Kachery node ID for this labbox:|`{nodeId}`|
|Using compute resource:|`{computeResourceUri}`|

## Using a remote compute resource

To configure labbox to use a remote compute resource, create a `labbox_config.yml` file in the base directory of the labbox_ephys repo with the following content:

```yaml
---
compute_resource_uri: feed://...
job_handlers:
  local:
    type: local
  partition1:
    type: remote
  partition2:
    type: remote
  partition3:
    type: remote
  timeseries:
    type: remote
```

replacing `feed://...` with the feed of the compute resource (see the section below for information on hosting a compute resource). You will also need to give permission for this labbox server to access the compute resource. For this, you will need the kachery node ID for this labbox, which is given above.

Alternatively, you can set the LABBOX_EPHYS_CONFIG environment variable to point to a local or remote configuration file. For example:

```
LABBOX_EPHYS_CONFIG=https://gist.githubusercontent.com/user/......./raw/labbox-ephys-1.yaml
```

## Hosting a compute resource

Follow these instructions for hosting the compute resource: [hosting a hither compute resource](https://github.com/flatironinstitute/hither/blob/master/doc/hosting_compute_resource.md)

As you run the configuration script, you will be prompted to give permission labbox-ephys to access this compute resource. You should provide the kachery node ID as provided above.