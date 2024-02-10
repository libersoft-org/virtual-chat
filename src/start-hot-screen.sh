#!/bin/sh

#[ ! -d "./node_modules/" ] && bun i
screen -dmS virtual-chat bun --watch virtual-chat.js
