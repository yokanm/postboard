#!/bin/bash
# ─── Postboard — PostgreSQL Backup Script ────────────────────────────────────
# Runs via cron inside the backup container (docker-compose.yml).
# Can also be run manually:
#   ./backups/scripts/backup.sh -h <host> -d <database> -u <user> -p <password>

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/postboard_${TIMESTAMP}.dump"
LOG_FILE="${BACKUP_DIR}/backup.log"
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postboard}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-postboard}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "Starting PostgreSQL backup: ${DB_NAME}@${DB_HOST}:${DB_PORT}"

# Perform backup
PGPASSWORD="${DB_PASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -Fc \
    -f "${BACKUP_FILE}" \
    -v \
    2>> "${LOG_FILE}"

# Verify backup
if [ -f "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(stat -c%s "${BACKUP_FILE}")
    log "Backup completed: ${BACKUP_FILE} (${BACKUP_SIZE} bytes)"

    # Test backup integrity
    pg_restore -l "${BACKUP_FILE}" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        log "Backup integrity check: PASSED"
    else
        log "Backup integrity check: FAILED"
        exit 1
    fi
else
    log "Backup failed: output file not created"
    exit 1
fi

# Cleanup old backups
find "${BACKUP_DIR}" -name "postboard_*.dump" -mtime "+${RETENTION_DAYS}" -delete
log "Cleaned up backups older than ${RETENTION_DAYS} days"

log "Backup completed successfully"
