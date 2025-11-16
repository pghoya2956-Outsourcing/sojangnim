#!/bin/bash
set -e

echo "=========================================="
echo "Running Supabase Migrations"
echo "=========================================="

MIGRATION_DIR="/docker-entrypoint-initdb.d/migrations"

if [ -d "$MIGRATION_DIR" ]; then
    # 마이그레이션 파일을 타임스탬프 순서로 실행
    for migration_file in $(ls -1 "$MIGRATION_DIR"/*.sql 2>/dev/null | sort); do
        echo "⏳ Applying migration: $(basename $migration_file)"
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$migration_file"
        echo "✅ Applied: $(basename $migration_file)"
    done
    echo "✅ All migrations completed successfully"
else
    echo "⚠️  No migrations directory found at $MIGRATION_DIR"
fi
