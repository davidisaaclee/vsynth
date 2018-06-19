#!/usr/bin/env bash
set -e

VERSION=$(npm version patch)
VERSION=$(echo $VERSION | cut -c 2-)

yarn build
cd gh-pages
git add .
git commit -am $VERSION
git push
cd ..

