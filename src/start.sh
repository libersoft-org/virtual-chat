#!/bin/sh

[ ! -d "./node_modules/" ] && bun i
bun chat.js $1
