#!/bin/sh
set -eu

echo "Running database migrations"
pnpm migration:run

echo "Starting API"
exec node dist/main