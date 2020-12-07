
# labbox_ephys_widgets_jp

Labbox ephys widgets for jupyter lab

## Development Installation


```bash
# First install the python package. This will also build the JS packages.
pip install -e .
```

Manually enable the jupyter lab extensions via:

```
jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build
jupyter labextension install .
```

For classic notebook, you can run:

```
jupyter nbextension install --sys-prefix --symlink --overwrite --py labbox_ephys_widgets_jp
jupyter nbextension enable --sys-prefix --py labbox_ephys_widgets_jp
```

### How to see your changes
#### Typescript:
To continuously monitor the project for changes and automatically trigger a rebuild, start Jupyter in watch mode:
```bash
jupyter lab --watch
```
And in a separate session, begin watching the source directory for changes:
```bash
npm run watch
```

After a change wait for the build to finish and then refresh your browser and the changes should take effect.

#### Python:
If you make a change to the python code then you will need to restart the notebook kernel to have it take effect.
