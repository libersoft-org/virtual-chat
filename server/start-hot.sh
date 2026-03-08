#!/bin/sh

echo -ne "\033]0;VIRTUAL CHAT SERVER (HOT)\007"
bun i --frozen-lockfile
bun --watch run src/app.ts "$@"
