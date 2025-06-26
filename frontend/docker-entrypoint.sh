#!/bin/sh
set -e

# No need to modify nginx config in production - using default port 80
echo "Starting nginx on port 80"

# Execute the original nginx command
exec "$@"