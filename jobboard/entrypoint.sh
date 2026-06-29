#!/bin/sh
# ─── Postboard API — Container Entrypoint ─────────────────────────────────────
# Runs as PID 1 inside the API container.
# Ensures migrations are applied before the Node process starts.
#
# Uses `exec` to replace the shell with the Node process so that signals
# (SIGTERM from `docker stop`) reach the app directly for graceful shutdown.

set -e

echo "[entrypoint] Applying Prisma migrations..."
npx prisma migrate deploy

echo "[entrypoint] Migrations complete. Starting server..."
exec node dist/src/server.js
