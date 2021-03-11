### Optionally host a compute resource server for calculations

If you want to use a remote computer to run calculations, then you will need to set up a hither compute resource server. Follow [these instructions](https://github.com/flatironinstitute/hither/blob/master/doc/hosting_compute_resource.md) for hosting the compute resource.

As you run the configuration script, you will be prompted to give permission for labbox-ephys to access the compute resource. You should provide the kachery node ID for the machine running labbox ephys. You can find this within the labbox-ephys GUI by clicking on the CONFIG tab and then the COMPUTE RESOURCE tab. Alternatively, you can run `kachery-p2p-node-info` on the computer hosting the labbox-ephys server.

When you run the compute resource you will get a compute resource URI. See the CONFIG tab in the labbox-ephys GUI to learn how to configure labbox to use this hither compute resource URI.
