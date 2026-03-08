#!/bin/sh

# Usage: ./start-dev.sh [server_url] [--privkey path] [--pubkey path]
# Server URL: first positional argument, e.g.: ./start-dev.sh wss://server.example.com:1234
# Default: ws://localhost:7011
# Certificates: --privkey and --pubkey for HTTPS dev server
# Default: server.key/server.crt or certs/server.key/certs/server.crt

while [ $# -gt 0 ]; do
	case "$1" in
	--privkey)
		export VITE_SSL_KEY="$2"
		shift 2
		;;
	--pubkey)
		export VITE_SSL_CERT="$2"
		shift 2
		;;
	*)
		if [ -z "$VITE_SERVER_URL" ]; then
			export VITE_SERVER_URL="$1"
			echo "Using custom server: $VITE_SERVER_URL"
		fi
		shift
		;;
	esac
done

echo -ne "\033]0;VIRTUAL CHAT CLIENT\007"
bun i --frozen-lockfile
#bun --bun run dev
npm run dev
