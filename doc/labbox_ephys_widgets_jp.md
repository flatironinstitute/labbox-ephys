# labbox_ephys_widgets_jp

Jupyter widgets for labbox-ephys

In the future, this Jupyterlab extension will be pip-installable through PyPI and npm. But for now, you must compile it and activate the extension in development mode.

## Prerequisites

Follow [these instructions](./labbox_ephys_web_server.md) to set up the prerequisites and start a kachery-p2p daemon.

## Install jupyterlab

Install a recent version of jupyterlab:

```
conda install jupyterlab
```

## Building the jupyterlab extension

After you install the prerequisites above, clone this repository and then install the python packages in development mode

```bash
cd labbox-ephys
pip install -e ./src/python

export NODE_OPTIONS="--max-old-space-size=8192"
pip install -e jupyterlab/labbox_ephys_widgets_jp
```

In addition to installing the Python package, the latter command will also build the typescript project (the front-end code that runs in the browser and renders the widgets). The `NODE_OPTIONS` command may be needed in order to avoid an out-of-memory error during compilation.

Next, activate the compiled jupyterlab extension:

```bash
jupyter serverextension enable labbox_ephys_widgets_jp --sys-prefix
jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build
jupyter labextension install jupyterlab/labbox_ephys_widgets_jp
```

The first of these commands installs a different jupyterlab extension and only needs to be run the first time.

Verify that the extension has been installed:

```
jupyter labextension list
```

Now, startup jupyter lab:

```
jupyter lab
```

This will open a jupyter lab session in your browser.

Within the browser, navigate to and open the following example notebook: `devel/example_notebooks/example2.ipynb`
