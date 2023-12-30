#!/bin/sh

#[ ! -d "./node_modules/" ] && bun i
screen -dmS chat bash -c '
while true; do
 bun chat.js || exit 1
done
'
