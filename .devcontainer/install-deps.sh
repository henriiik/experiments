#!/bin/bash

set -xe;

. ~/.asdf/asdf.sh

asdf install

npm i -g yarn

yarn install
