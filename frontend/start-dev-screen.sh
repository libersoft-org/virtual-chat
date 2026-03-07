#!/bin/sh

ARGS="$*"
screen -dmS virtual-chat-fe bash -c ". ./colors.sh; trap bash SIGINT; (./start-dev.sh $ARGS ; bash);"
