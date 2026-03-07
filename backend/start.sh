#!/bin/sh

echo -ne "\033]0;VIRTUAL CHAT BACKEND\007"
bun i --frozen-lockfile
bun run src/app.ts "$@"
