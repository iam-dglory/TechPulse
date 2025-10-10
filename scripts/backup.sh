#!/bin/bash

# TechPulse Database Backup Script
set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-techpulse_production}"
DB_USER="${DB_USER:-techpulse_prod}"
DB_PASSWORD="${DB_PASSWORD}"
DB_HOST="${DB_HOST:-mysql}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Database backup
echo "Starting database backup..."
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --hex-blob \
    --quick \
    --lock-tables=false \
    $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

# Redis backup (if needed)
echo "Creating Redis backup..."
redis-cli -h redis -a $REDIS_PASSWORD BGSAVE
sleep 5
cp /data/dump.rdb $BACKUP_DIR/redis_backup_$DATE.rdb

# Upload to cloud storage (optional)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo "Uploading backups to S3..."
    aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://$AWS_S3_BUCKET/database/
    aws s3 cp $BACKUP_DIR/redis_backup_$DATE.rdb s3://$AWS_S3_BUCKET/redis/
fi

echo "Backup completed successfully: $DATE"
