# labbox-ephys developer instructions

## Prerequisites

Follow the instructions on the main README to create a conda environment and start a kachery-p2p daemon.

Install [Visual Studio Code](https://code.visualstudio.com/).

## Clone this repo and open in vscode

```
git clone <this-repo> labbox-ephys
cd labbox-ephys
code .
```

## Use the vscode tasks

Within vscode, `Ctrl+Shift+P` brings up the command pallette. Select "`Tasks: Run Task`" and then select one of the tasks in the dropdown. To get started you should use `yarn-install` and `pip-install-dev`. Then run the `START DEV` task.

The task definitions can be found in [.vscode/tasks.json](../.vscode/tasks.json).



