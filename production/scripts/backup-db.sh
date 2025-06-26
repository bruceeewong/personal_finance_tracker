#!/bin/bash

# Production Database Backup Script
# Usage: ./backup-db.sh [backup-directory]

BACKUP_DIR=${1:-./production/backups}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="personal-finance-backup-$TIMESTAMP.sql"
COMPOSE_FILE="production/docker-compose.prod.yml"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Creating database backup..."

# Create backup
if docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump -U postgres personal_finance > "$BACKUP_DIR/$BACKUP_FILE"; then
    echo "✅ Backup created: $BACKUP_DIR/$BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "✅ Backup compressed: $BACKUP_DIR/$BACKUP_FILE.gz"
    
    # Keep only last 30 backups
    find "$BACKUP_DIR" -name "personal-finance-backup-*.sql.gz" -type f -mtime +30 -delete
    echo "✅ Old backups cleaned up (kept last 30 days)"
    
else
    echo "❌ Backup failed!"
    exit 1
fi