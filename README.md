# Labbox-ephys

![labbox-ephys-install-tests](https://github.com/laboratorybox/labbox-ephys/workflows/labbox-ephys-install-tests/badge.svg?branch=master)

**Under development**

Analysis and visualization of neurophysiology recordings and spike sorting results.

### Installation instructions

You can either run labbox-ephys as a JupyterLab extension, a local web server, or as a service in the cloud.

* JupyterLab extension: [labbox_ephys_widgets_jp](doc/labbox_ephys_widgets_jp.md)
* Local web server: [labbox_ephys web server](doc/labbox_ephys_web_server.md)
* Cloud service: not yet documented

### Optionally host a compute resource server for calculations

If you want to use a remote computer to run calculations, then you will need to set up a hither compute resource server. Follow [these instructions](https://github.com/flatironinstitute/hither/blob/master/doc/hosting_compute_resource.md) for hosting the compute resource.

As you run the configuration script, you will be prompted to give permission for labbox-ephys to access the compute resource. You should provide the kachery node ID for the machine running labbox ephys. You can find this within the labbox-ephys GUI by clicking on the CONFIG tab and then the COMPUTE RESOURCE tab. Alternatively, you can run `kachery-p2p-node-info` on the computer hosting the labbox-ephys server.

When you run the compute resource you will get a compute resource URI. See the CONFIG tab in the labbox-ephys GUI to learn how to configure labbox to use this hither compute resource URI.

## Information for developers

[Instructions on opening labbox-ephys in a development environment](doc/development-environment.md)

## Primary developers

Jeremy Magland and Jeff Soules

Center for Computational Mathematics, Flatiron Institute
