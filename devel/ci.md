# Continuous integration

We use [continuous integration](https://docs.github.com/en/free-pro-team@latest/actions/guides/about-continuous-integration) to automatically test the typescript compilation and to automatically build new docker images and push to dockerhub.

The actions are configured in [.github/workflows](../.github/workflows)

## Installation tests

See: [.github/workflows/labbox-ephys-install-tests.yml](../.github/workflows/labbox-ephys-install-tests.yml)

This workflow is triggered whenever a new PR (pull request) is created, a PR is updated, or a new commit is pushed to the master branch. A checkmark or 'x' icon on github will indicate whether the PR passes the test. A badge on the `README.md` indicates whether the push to master passed the test.

Many PRs consist of a long chain of sequential commits, as the author refines the work. 
But since tests are triggered with every commit merged to the main code trunk, merging such a PR as-is would
result in the tests being run repeatedly, without providing any additional value:
if the final state works, the test status of any intermediate
state is immaterial. The best practice to avoid needlessly consuming
resources and attention is to combine the commits in a feature branch into
a single commit linking the original branch point to the final merge point. This operation is known as a
[squash and merge](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/about-pull-request-merges#squash-and-merge-your-pull-request-commits) and should be done when merging feature branches back to master.

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

The next line [sets up the default `shell` environment used to execute all `run` steps in the job](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions#jobsjob_iddefaultsrun). We want to use a login bash session, to ensure running of
login-time setup from `.profile` and/or `.bashrc` (like setting up environment variables). So we have:

```yaml
defaults:
  run:
    shell: bash -l {0}
```

The following code defines the actual test:

```yaml
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

The test builds and installs the jupyterlab extension.

[conda-incubator/setup-miniconda@v2](https://github.com/conda-incubator/setup-miniconda) is a third party github
action that gives us a conda environment for the test. The test constructs a matrix of
[`operating systems` x `python versions`] and creates a test environment for each combination. It then executes
each of the `run` commands using the default shell specified in the `defaults: run:` section (otherwise
we'd have to call `bash` explicitly in each `run` line). If any of the `run` statements returns an error code,
then the test is considered a failure; otherwise, it is considered to have passed.

## Build docker image on new version tag

The labbox-ephys-push-docker workflow lets you automatically build a new docker image for labbox-ephys.

To push a new release to dockerhub:

* Increment the version throughout the source code. For example, to increment from 0.4.5 to 0.4.6,
search/replace these strings, taking care not to increment coincidental occurrences of 0.4.5.

* Apply a tag with the release.

```
git tag v0.4.6
```

* Push the commit with the tag:

```
git push --tags
```

See: [.github/workflows/labbox-ephys-push-docker.yml](.github/workflows/labbox-ephys-push-docker.yml)

This workflow is triggered by tags that begin with the letter "v":

```yaml
on:
  push:
    tags:
      - 'v*'
```

In order to push to Dockerhub, a couple of secret variables are registered on github:

```yaml
-
    name: Login to DockerHub
    uses: docker/login-action@v1
    with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
```
