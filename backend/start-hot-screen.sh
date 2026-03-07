#!/bin/sh

ARGS="$*"
screen -dmS virtual-chat-be bash -c ". ./colors.sh; trap bash SIGINT; (./start-hot.sh $ARGS ; bash);"
