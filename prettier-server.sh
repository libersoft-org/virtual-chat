#!/bin/sh

cd server
npx prettier --write "**/*.{js,ts,json}"
cd ..
