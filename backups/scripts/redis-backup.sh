#!/bin/bash
# ─── Postboard — Redis RDB Backup Script ─────────────────────────────────────
# Copies Redis AOF/RDB files to backup directory.
# Redis persistence is configured in docker-compose.yml (appendonly yes).

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups/redis}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS="${RETENTION_DAYS:-7}"
REDIS_DATA_DIR="${REDIS_DATA_DIR:-/data}"
REDIS_HOST="${REDIS_HOST:-redis}"
REDIS_PORT="${REDIS_PORT:-6379}"

mkdir -p "${BACKUP_DIR}"

# Trigger a Redis BGSAVE
echo "Triggering Redis BGSAVE..."
redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" BGSAVE
sleep 2

# Copy the latest dump
if [ -f "${REDIS_DATA_DIR}/dump.rdb" ]; then
    cp "${REDIS_DATA_DIR}/dump.rdb" "${BACKUP_DIR}/redis_${TIMESTAMP}.rdb"
    echo "Redis RDB backup: ${BACKUP_DIR}/redis_${TIMESTAMP}.rdb"
else
    echo "Warning: dump.rdb not found in ${REDIS_DATA_DIR}"
fi

# Also backup AOF if present
if [ -f "${REDIS_DATA_DIR}/appendonly.aof" ]; then
    cp "${REDIS_DATA_DIR}/appendonly.aof" "${BACKUP_DIR}/appendonly_${TIMESTAMP}.aof"
    echo "Redis AOF backup: ${BACKUP_DIR}/appendonly_${TIMESTAMP}.aof"
fi

# Cleanup old backups
find "${BACKUP_DIR}" -name "redis_*.rdb" -mtime "+${RETENTION_DAYS}" -delete
find "${BACKUP_DIR}" -name "appendonly_*.aof" -mtime "+${RETENTION_DAYS}" -delete
echo "Cleaned up backups older than ${RETENTION_DAYS} days"
