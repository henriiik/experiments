#!/bin/bash

set -xe;

git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.9.0

. ~/.asdf/asdf.sh

asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
asdf plugin add pulumi https://github.com/canha/asdf-pulumi.git
asdf plugin add aws-vault https://github.com/karancode/asdf-aws-vault.git

