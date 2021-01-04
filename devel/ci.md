# Continuous integration

We use continuous integration to automatically test the typescript compilation and to automatically build new docker images and push to dockerhub.

The actions are configured in [.github/workflows](.github/workflows)

## Installation tests

See: [.github/workflows/labbox-ephys-install-tests.yml](.github/workflows/labbox-ephys-install-tests.yml)

This workflow is triggered whenever a new PR is created, a PR is updated, or a new commit is pushed to the master branch. A checkmark or 'x' icon on github will indicate whether the PR passes the test. A badge on the README.md indicates whether the push to master passed the test.

Explain importance of using squash merge for merging PR's so that we only get one test per PR merge.

The following part of the yml causes the test to run on the above-mentioned triggers:

```yaml
name: labbox-ephys-install-tests
on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches:
      - master
```

It is important to run these tests using a login bash session. So we have:

```yaml
defaults:
  run:
    shell: bash -l {0}
```

The following code defines the actual test:

```
jobs:
  install_jupyterlab:
    name: Ex1 (${{ matrix.python-version }}, ${{ matrix.os }})
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        # os: ["ubuntu-latest", "macos-latest"] - macos-latest not working on the node compile step: ld: library not found for -lstdc++
        os: ["ubuntu-latest"]
    steps:
      - uses: actions/checkout@v2
      - uses: conda-incubator/setup-miniconda@v2
        with:
          python-version: '3.8'
          activate-environment: test
      - run: python --version && conda info && conda list
      - run: conda install jupyterlab
      - run: conda install -c conda-forge nodejs
      - run: conda list
      - run: pip install -e ./python
      - run: pip --version && python --version && pip install -e jupyterlab/labbox_ephys_widgets_jp
      - run: conda list
      - run: jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build
      - run: jupyter labextension install jupyterlab/labbox_ephys_widgets_jp
      - run: jupyter labextension list
```

The conda-incubator/setup-miniconda@v2 is a third party github action that gives us a conda environment for the test.

The test builds and installs the jupyterlab extension.

## Build docker image on new version tag

The labbox-ephys-push-docker workflow lets you automatically build a new docker image for labbox-ephys.

To push a new release to dockerhub:

* Increment the version throughout the source code. For example, to increment from 0.4.5 to 0.4.6, search/replace these strings, taking care not to increment coincidental occurrences of 0.4.5.

* Apply a tag with the release.

```
git tag v0.4.6
```

* Push and push tag

```
git push --tags
```

See: [.github/workflows/labbox-ephys-push-docker.yml](.github/workflows/labbox-ephys-push-docker.yml)

This workflow is triggered by tags that begin with the letter "v".

In order to push to Dockerhub, a couple of secret variables are registered on github:

```yaml
-
    name: Login to DockerHub
    uses: docker/login-action@v1
    with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
```