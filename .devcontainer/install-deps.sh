#!/bin/bash

set -xe;

cp ./.tool-versions ~/.tool-versions

. ~/.asdf/asdf.sh

asdf install

npm i -g yarn

yarn install
