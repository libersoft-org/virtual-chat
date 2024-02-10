#!/bin/sh

#[ ! -d "./node_modules/" ] && bun i
screen -dmS virtual-chat bash -c '
while true; do
 bun virtual-chat.js || exit 1
done
'
