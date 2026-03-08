#!/bin/sh

ARGS="$*"
screen -dmS virtual-chat-server bash -c ". ./colors.sh; trap bash SIGINT; (./start.sh $ARGS ; bash);"
