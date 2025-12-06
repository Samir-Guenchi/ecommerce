#!/bin/bash
# ============================================
# Database Restore Script
# Algérie Poste E-Commerce
# ============================================

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USERNAME:-root}"
DB_PASS="${DB_PASSWORD}"
DB_NAME="${DB_DATABASE:-ap_ecommerce}"

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "❌ Usage: $0 <backup_file.sql.gz>"
  echo ""
  echo "Available backups:"
  ls -lh ./backups/*.sql.gz 2>/dev/null || echo "   No backups found in ./backups/"
  exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  WARNING: This will restore the database '$DB_NAME' from backup."
echo "   All current data will be REPLACED!"
echo ""
echo "   Backup file: $BACKUP_FILE"
echo "   Database: $DB_NAME"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Restore cancelled."
  exit 1
fi

echo ""
echo "🔄 Starting restore..."

# Check if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "   Decompressing backup..."
  TEMP_FILE=$(mktemp)
  gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
  RESTORE_FILE="$TEMP_FILE"
else
  RESTORE_FILE="$BACKUP_FILE"
fi

# Perform restore
echo "   Restoring database..."
if [ -z "$DB_PASS" ]; then
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" < "$RESTORE_FILE"
else
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$RESTORE_FILE"
fi

# Clean up temp file if created
if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
  rm "$TEMP_FILE"
fi

echo ""
echo "✅ Database restored successfully!"
echo "   Database: $DB_NAME"
echo "   From: $BACKUP_FILE"
echo ""
echo "✨ Done!"
