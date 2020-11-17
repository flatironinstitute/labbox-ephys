# #!/bin/bash

# set -ex

# hither
cd /workspaces/hither
pip install --no-deps -e .
echo "export PATH=/workspaces/hither/bin:\$PATH" >> ~/.bashrc

# kachery
cd /workspaces/kachery
pip install --no-deps -e .

# kachery-p2p
cd /workspaces/kachery-p2p
pip install --no-deps -e .

# labbox_ephys
cd /workspaces/labbox-ephys/python
pip install --no-deps -e .

# nwb_datajoint
cd /workspaces/labbox-ephys/nwb_datajoint
pip install --no-deps -e .

cat <<EOT >> ~/.bashrc
export PATH=/home/vscode/.local/bin:$PATH

alias gs="git status"
alias gpl="git pull"
alias gps="git push"
alias gpst="git push && git push --tags"
alias gc="git commit"
alias ga="git add -u"
EOT
