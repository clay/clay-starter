#!/usr/bin/env bash

# Exit the script as soon as something fails.
set -e

# What is the backend's name and port? The backend should be the name of the
# Docker image that is linked to nginx.
PLACEHOLDER_BACKEND_NAME="clay"
PLACEHOLDER_BACKEND_PORT="3001"
PLACEHOLDER_VHOST="docker.for.mac.localhost"
CLAY_SITE_HOST="localhost"

# Where is our default config located?
DEFAULT_CONFIG_PATH="/etc/nginx/conf.d/default.conf"

# Replace all instances of the placeholders with the values above.
sed -i "s/PLACEHOLDER_VHOST/${PLACEHOLDER_VHOST}/g" "${DEFAULT_CONFIG_PATH}"
sed -i "s/PLACEHOLDER_BACKEND_NAME/${PLACEHOLDER_BACKEND_NAME}/g" "${DEFAULT_CONFIG_PATH}"
sed -i "s/PLACEHOLDER_BACKEND_PORT/${PLACEHOLDER_BACKEND_PORT}/g" "${DEFAULT_CONFIG_PATH}"
sed -i "s/CLAY_SITE_HOST/${CLAY_SITE_HOST}/g" "${DEFAULT_CONFIG_PATH}"

# Execute the CMD from the Dockerfile and pass in all of its arguments.
exec "$@"
