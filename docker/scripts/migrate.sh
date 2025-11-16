#!/bin/bash

# Supabase 마이그레이션 실행 스크립트
# 기존 DB가 있을 때 새로운 마이그레이션 적용

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MIGRATION_DIR="$PROJECT_ROOT/supabase/migrations"

# 환경변수 로드
if [ -f "$SCRIPT_DIR/../.env.docker" ]; then
    source "$SCRIPT_DIR/../.env.docker"
fi

POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-54322}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"

echo "=========================================="
echo "Supabase Migration Runner"
echo "=========================================="
echo "Database: $DB_HOST:$DB_PORT/$DB_NAME"
echo "Migration Directory: $MIGRATION_DIR"
echo ""

# PostgreSQL 연결 확인
echo "⏳ Checking database connection..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to database"
    echo "   Make sure Docker containers are running: docker-compose up -d"
    exit 1
fi

echo "✅ Database connection successful"
echo ""

# 마이그레이션 이력 테이블 생성
echo "⏳ Creating migration history table..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<-EOSQL
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT NOW()
    );
EOSQL

echo "✅ Migration history table ready"
echo ""

# 마이그레이션 파일 실행
if [ ! -d "$MIGRATION_DIR" ]; then
    echo "❌ Migration directory not found: $MIGRATION_DIR"
    exit 1
fi

MIGRATION_COUNT=0
SKIPPED_COUNT=0

for migration_file in $(ls -1 "$MIGRATION_DIR"/*.sql 2>/dev/null | sort); do
    filename=$(basename "$migration_file")
    version=$(echo "$filename" | cut -d'_' -f1)

    # 이미 적용된 마이그레이션인지 확인
    ALREADY_APPLIED=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM public.schema_migrations WHERE version = '$version'")

    if [ $(echo $ALREADY_APPLIED | tr -d ' ') -gt 0 ]; then
        echo "⏭️  Skipping (already applied): $filename"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        continue
    fi

    echo "⏳ Applying migration: $filename"

    # 마이그레이션 적용
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration_file"

    if [ $? -eq 0 ]; then
        # 성공 시 이력 기록
        PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "INSERT INTO public.schema_migrations (version) VALUES ('$version')"
        echo "✅ Applied: $filename"
        MIGRATION_COUNT=$((MIGRATION_COUNT + 1))
    else
        echo "❌ Failed to apply: $filename"
        exit 1
    fi

    echo ""
done

echo "=========================================="
echo "Migration Summary"
echo "=========================================="
echo "Applied: $MIGRATION_COUNT"
echo "Skipped: $SKIPPED_COUNT"
echo "✅ All migrations completed successfully"
