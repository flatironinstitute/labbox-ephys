# {{ projectName }} web server

Tested on Linux, should also run on macOS and Windows Subsystem for Linux.

## Prerequisites and kachery setup

It is recommended that you start with a fresh conda environment with Python 3.8 or higher. For example:

```bash
conda create -n {{ projectName }} python=3.8
```

After activating the new environment (`conda activate {{ projectName }}`), install the following prerequisite packages:

```bash
conda install -c conda-forge nodejs
npm install -g serve
pip install {{ projectName }}

# On macOS you may need to use the following to get a recent version of nodejs:
# conda install nodejs -c conda-forge --repodata-fn=repodata.json
```

Choose an existing directory where temporary kachery files will be stored and set the KACHERY_STORAGE_DIR environment variable (if not set, `$HOME/kachery-storage` will be used):

```
# This should be the full path to an existing directory.
# For example, you could use: $HOME/kachery-storage
export KACHERY_STORAGE_DIR="<your-chosen-tmp-file-directory>" 
```

Ensure that this environment variable is set with each new terminal session by adding the above line to your ~/.bashrc file.

Open a new terminal and start a kachery-p2p daemon, selecting a `<node-label>` for display purposes:

```
# Make sure you are in the conda environment created above
# and that the KACHERY_STORAGE_DIR env variable is set
kachery-p2p-start-daemon --label <node-label>
```

Keep this running. It allows communication between the Python script and the GUI. See below for more advanced configuration options, or see [kachery-p2p](https://github.com/flatironinstitute/kachery-p2p).

## Installing and running the app

Upgrade to the latest {{ projectName }} (it may be worth restarting the kachery daemon in case updates have been made to the kachery-p2p package):

```
pip install --upgrade {{ projectName }}
```

Now run the {{ projectName }} service:

```
# First make sure you are in the conda environment
{{ projectName }}
```

Open the web app in a browser at http://localhost:{{ clientPort }}.

{{ startWebServerText1 }}

## Advanced kachery daemon configuration

You can also set the following optional environment variables

```bash
# KACHERY_P2P_CONFIG_DIR
# This should correspond to the config directory being used by the kachery-p2p daemon
# By default it is $HOME/.kachery-p2p
export KACHERY_P2P_CONFIG_DIR="<Config directory for kachery-p2p>"

# KACHERY_P2P_API_PORT
# This should correspond to the port being used by the kachery-p2p daemon
# By default it is {{ clientPort }}
export KACHERY_P2P_API_PORT="<Port number used by kachery-p2p daemon>"
```

See [kachery-p2p](https://github.com/flatironinstitute/kachery-p2p)