#!/bin/sh
set -e

# Replace PORT placeholder in nginx config with actual port
if [ -n "$PORT" ]; then
    echo "Configuring nginx to listen on port $PORT"
    sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf
fi

# Execute the original nginx command
exec "$@"