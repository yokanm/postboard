#!/bin/sh
# ─── Postboard Email Worker — Container Entrypoint ───────────────────────────
# Starts the BullMQ email worker process.

set -e

echo "[worker-entrypoint] Starting email worker..."
exec node dist/src/workers/email.worker.js
