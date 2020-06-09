# #!/bin/bash

# set -ex

# hither
cd /workspaces/hither
pip install --no-deps -e .
echo "export PATH=/workspaces/hither/bin:\$PATH" >> ~/.bashrc

# kachery
cd /workspaces/kachery
pip install --no-deps -e .

# labbox_ephys
cd /workspaces/labbox-ephys/python
pip install --no-deps -e .

mkdir -p /data/kachery-storage

cat <<EOT >> ~/.bashrc
alias gs="git status"
alias gpl="git pull"
alias gps="git push"
alias gpst="git push && git push --tags"
alias gc="git commit"
alias ga="git add -u"
EOT
