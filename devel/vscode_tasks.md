# labbox-ephys vscode tasks

Visual Studio Code tasks automate much of the development workflow for labbox-ephys.

These are found in [.vscode/tasks.json](.vscode/tasks.json) and [.vscode/tasks](.vscode/tasks)

To run the tasks within vscode, use `Ctrl+Shift+P` and then `Tasks: Run Task`. Select the task from the dropdown menu

* **yarn install** - install the dependencies needed to run the web app. This only needs to be run once, or whenever the dependencies in package.json change. The dependency packages are downloaded to the `./node_modules` folder, which should never be added to the git repo.
* **START DEV** - For convenience, this starts both the web server front end (**start dev client**) and the Python back end (**start dev api**) and provides a link to open the development web application in a browser. Hot module reloading is enabled, so as you make changes to the front-end code, the browser page will automatically update. However, if you modify the backend Python code, you will need to restart the api task.
* **code generation** - run this if you have added or removed an extension or have modified any of the .j2 template codes.
* **start code sync** - start the service that will automatically synchronize code between `src/extensions` and `jupyterlab/labbox_ephys_widgets_jp/src/extensions`.
* **labextension install** - install the jupyterlab extension
* **labextension dev** - start the service that watches for changes in the source code and updates the installed jupyter extension. This is generally faster than rerunning "labbextension install". You should run "labbextension install" first.
* **jupyterlab dev** - Run a jupyterlab server. It uses the `--watch` flag so that the jupyterlab server does not need to be restarted when updates are made to the lab extension. However you will need to reload the jupyterlab browser page (and restart the Python runtime kernel) in order for the changes to take effect.
