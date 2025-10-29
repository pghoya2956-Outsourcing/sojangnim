#!/bin/bash
set -e

echo "👤 Creating admin user for E2E tests..."

# Supabase 로컬 Service Role Key (공개된 기본값)
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

# Admin 사용자 생성
curl -s -X POST 'http://localhost:54321/auth/v1/admin/users' \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "email_confirm": true
  }' > /dev/null

echo "✅ Admin user created: admin@example.com"

# 검증
RESPONSE=$(curl -s -X GET 'http://localhost:54321/auth/v1/admin/users' \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY")

if echo "$RESPONSE" | grep -q "admin@example.com"; then
  echo "✅ Admin user verified in Supabase Auth"
else
  echo "❌ Admin user not found in Auth"
  exit 1
fi
