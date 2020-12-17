# Jupyter Lab File Sync Requirements

As documented in [the documentation on labbox_ephys_widgets_jp](labbox_ephys_widgets_jp.md),
labbox-ephys currently provides experimental support for adding browser-based
user interface widgets (visualizations,
electrode geometry layouts, time series, etc) in [Jupyter notebooks](https://jupyter.org/).

The labbox widget extension system makes it straightforward to develop
reusable user interface elements suitable for both the web-delivered interface and other applications.
However, due to difficulties with handling dependencies in a Jupyter environment,
it is necessary to clone the source files for the widgets.

## Rationale & Requirements

Jupyter requires specific versions of various JavaScript libraries, including
React (the principal user interface framework used for labbox-ephys). These versions are
sometimes in conflict with the versions that are appropriate for use with
the labbox web user interface. To our knowledge, this situation is not well-handled
by package management tools: we cannot have a single code file importing
or depending upon different versions of a library based on the calling
environment.

To get around this issue, we duplicate the contents of the
[main web user interface element directory](../src/extensions/)
into a separate directory used to compile the Jupyter extension (under
`jupyterlab/labbox_ephys_widgets_jp/src/extensions`). To avoid checking
every file into version control twice, the contents of the Jupyter lab copy
are excluded from git via `.gitignore`.

## Solutions & Compile Process Impacts

This system is mostly automated and should not have
substantial impact on the workflow for either developers or non-development users.

### If you are not a developer:

When you build the Jupyter extension, any files in the `src/extensions/`
directory will automatically be copied to the appropriate location under
the `jupyterlab` directory tree. You should not need to do anything
(but be sure not to edit files under `jupyterlab/labbox_ephys_widgets_jp/src/extensions`
as these edits will be overwritten when you install the Jupyter labextension).

Our build scripts look for the presence of a lock file at `jupyterlab/codesync.txt` to
identify whether it is safe to overwrite files in the `jupyterlab` directory tree.
This file is not tracked in version control, but if it is present for
some reason, you may see an error message when
attempting to execute `pip install -e jupyterlab/labbox_ephys_widgets_jp`. If
you do see this error message, simply delete the `jupyterlab/codesync.txt`
lock file and try again.

### If you are a developer using VSCode:

For developers, it may be convenient during development to make edits to either
version of these files while still keeping the versions in sync. We would
also like to avoid a situation where the wrong copy is edited in error.

To make this easier, we have created a VSCode task called `start_code_sync`. When
run (`ctrl-shift-p`, choose `Tasks: Run Task` then `start code sync`), this task
will place a lock file at `jupyterlab/codesync.txt` to indicate that
development is occuring on this copy of the labbox code. While this file is present, the
build/install script for our Jupyter labextension python package will refuse to
run unless the code versions in the `jupyterlab` directory match those in the
main `src` directory.

The VSCode task also initiates a [unison](https://www.cis.upenn.edu/~bcpierce/unison/) process
in order to keep these two directory trees in sync. If this tool is not installed on your
system, it can be installed by executing:

`apt-get install unison`

on `apt`-based OSes (or using your local package manager for non-`apt` OSes).
You should then execute:

`curl -Lo /usr/local/bin/unison-fsmonitor https://github.com/TentativeConvert/Syndicator/raw/master/unison-binaries/unison-fsmonitor && chmod a+x /usr/local/bin/unison-fsmonitor` 

to install the `fsmonitor` tool that allows `unison` to run continuously and monitor directories for changes.
This combination of utilities will ensure your files remain in sync and allow you to develop using either
copy of the extension files.

### If you are developing with your own tool chain:

In this case, we cannot provide a VSCode task to automatically sync the two directories through
your development environment, so you will need to keep them in sync yourself.

The combination of `unison` and `fsmonitor` described above will still make development much easier,
and we would encourage you to use it. We would also encourage you to make sure that the
`jupyterlab/codesync.txt` lock file is present in your copy of the source code.
(Simply executing `touch jupyterlab/codesync.txt` from the base directory where you have
downloaded the labbox code base should suffice for POSIX systems.) This file is not
in version control, but it acts as a safety to ensure that the extension installation
process does not overwrite changes you have intentionally made in the `jupyterlab` directory tree.
