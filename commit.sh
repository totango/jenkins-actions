#!/bin/bash

git status

echo "If this looks okay to you please type commit message:"
read message

npm i -g @zeit/ncc
ncc build index.js

git add .
git commit -am "$message"
git push
