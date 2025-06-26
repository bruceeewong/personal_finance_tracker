#!/bin/bash

# Production Database Restore Script
# Usage: ./restore-db.sh <backup-file>

BACKUP_FILE=$1
COMPOSE_FILE="production/docker-compose.prod.yml"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    echo "Example: $0 ./backups/personal-finance-backup-20250626-120000.sql.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will replace all data in the database!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "Starting database restore..."

# Stop backend to prevent connections
echo "Stopping backend service..."
docker-compose -f "$COMPOSE_FILE" stop backend

# Check if backup is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Restoring from compressed backup..."
    zcat "$BACKUP_FILE" | docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres personal_finance
else
    echo "Restoring from uncompressed backup..."
    docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres personal_finance < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
    
    # Restart backend
    echo "Starting backend service..."
    docker-compose -f "$COMPOSE_FILE" start backend
    
    echo "✅ Restore completed!"
else
    echo "❌ Restore failed!"
    
    # Still try to restart backend
    docker-compose -f "$COMPOSE_FILE" start backend
    exit 1
fi