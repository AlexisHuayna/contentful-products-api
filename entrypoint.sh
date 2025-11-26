#!/bin/sh
set -e

echo "Running database migrations..."
npm run migration:run:prod

echo "Starting application..."
npm run start:prod
