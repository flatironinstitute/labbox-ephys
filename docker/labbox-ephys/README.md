# Deploy labbox-ephys docker image

This directory contains scripts for building and deploying the labbox-ephys docker image.

Run the following to build the image locally:

```bash
cd docker/labbox-ephys
./build_docker.sh
```

Or run the following to build the image and push to dockerhub:

```bash
./build_docker.sh --push
```

Note: the tag of the built image is taken from the `version` field inside the `package.json` file at the root of this repo.

Once pushed to dockerhub, the `labbox-launcher` command can be used to launch the labbox-ephys service. (See the main installation instructions)