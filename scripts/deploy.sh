#!/usr/bin/env bash
set -e

VERSION=$(npm version $1)
VERSION=$(echo $VERSION | cut -c 2-)

cd gh-pages
git add .
git commit -am $VERSION
git push
cd ..

