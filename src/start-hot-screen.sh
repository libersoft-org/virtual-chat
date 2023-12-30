#!/bin/sh

#[ ! -d "./node_modules/" ] && bun i
screen -dmS chat bun --watch chat.js
