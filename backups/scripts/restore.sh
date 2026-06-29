#!/bin/bash
# ─── Postboard — PostgreSQL Restore Script ───────────────────────────────────
# Usage:
#   ./backups/scripts/restore.sh -f <backup_file> -h <host> -d <database> -u <user> -p <password>
#
# WARNING: This will DROP the existing database and restore from backup.
# All data in the target database will be lost.

set -euo pipefail

BACKUP_FILE=""
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postboard}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-postboard}"

usage() {
    echo "Usage: $0 -f <backup_file> [-h host] [-p port] [-u user] [-d database]"
    exit 1
}

while getopts "f:h:p:u:d:" opt; do
    case $opt in
        f) BACKUP_FILE="$OPTARG" ;;
        h) DB_HOST="$OPTARG" ;;
        p) DB_PORT="$OPTARG" ;;
        u) DB_USER="$OPTARG" ;;
        d) DB_NAME="$OPTARG" ;;
        *) usage ;;
    esac
done

if [ -z "${BACKUP_FILE}" ]; then
    echo "Error: backup file is required (-f)"
    usage
fi

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "=== Postboard — Database Restore ==="
echo "Backup file: ${BACKUP_FILE}"
echo "Target: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
echo ""
echo "WARNING: This will DROP the existing '${DB_NAME}' database!"
read -rp "Are you sure? (type 'yes' to proceed): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore cancelled."
    exit 1
fi

# Kill existing connections
echo "Terminating existing connections..."
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '${DB_NAME}'
      AND pid <> pg_backend_pid();
" > /dev/null 2>&1 || true

# Drop and recreate database
echo "Dropping database..."
PGPASSWORD="${DB_PASSWORD}" dropdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" --if-exists "${DB_NAME}"

echo "Creating database..."
PGPASSWORD="${DB_PASSWORD}" createdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}"

# Restore from backup
echo "Restoring from backup..."
PGPASSWORD="${DB_PASSWORD}" pg_restore \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    -v \
    "${BACKUP_FILE}"

echo ""
echo "Restore completed successfully!"
echo "Run 'npx prisma migrate deploy' to ensure migrations are up to date."
