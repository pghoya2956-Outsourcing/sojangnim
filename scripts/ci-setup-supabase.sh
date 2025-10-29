#!/bin/bash
set -e

echo "🚀 Starting Supabase for CI..."

# 1. Supabase 시작
supabase start
supabase status

echo ""
echo "⏳ Waiting for services to be ready..."

# 2. PostgreSQL 헬스체크
timeout 60 bash -c 'until docker exec supabase_db_sojangnim pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done'
echo "✅ PostgreSQL ready"

# 3. REST API 헬스체크
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
timeout 60 bash -c "until curl -f http://localhost:54321/rest/v1/ -H 'apikey: $ANON_KEY' > /dev/null 2>&1; do sleep 1; done"
echo "✅ REST API ready"

# 4. Auth API 헬스체크
timeout 60 bash -c 'until curl -f http://localhost:54321/auth/v1/health > /dev/null 2>&1; do sleep 1; done'
echo "✅ Auth API ready"

# 5. Storage API 헬스체크
timeout 60 bash -c 'until curl -f http://localhost:54321/storage/v1/healthcheck > /dev/null 2>&1; do sleep 1; done'
echo "✅ Storage API ready"

echo ""
echo "📊 Verifying database setup..."

# 6. 테이블 확인
docker exec supabase_db_sojangnim psql -U postgres -d postgres -c "SELECT COUNT(*) FROM admin_users;" > /dev/null
echo "✅ admin_users table exists"

docker exec supabase_db_sojangnim psql -U postgres -d postgres -c "SELECT COUNT(*) FROM products;" > /dev/null
echo "✅ products table exists"

docker exec supabase_db_sojangnim psql -U postgres -d postgres -c "SELECT COUNT(*) FROM storage.buckets WHERE id = 'product-images';" > /dev/null
echo "✅ product-images bucket exists"

echo ""
echo "✅ Supabase is ready for testing!"
