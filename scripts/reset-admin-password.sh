#!/bin/bash

# Admin 비밀번호 초기화 스크립트
# 사용법: ./scripts/reset-admin-password.sh

echo "🔐 Admin 비밀번호 초기화 중..."

# 1. admin_users 테이블에 이메일 추가 (이미 있으면 무시)
supabase db execute --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" <<SQL
INSERT INTO admin_users (email)
VALUES ('admin@example.com')
ON CONFLICT (email) DO NOTHING;
SQL

echo "✅ admin_users 테이블 업데이트 완료"

# 2. Supabase Auth에 사용자 생성 안내
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 다음 단계를 수동으로 진행해주세요:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Supabase Studio 접속:"
echo "   http://127.0.0.1:54323"
echo ""
echo "2. 왼쪽 메뉴에서 'Authentication' 클릭"
echo ""
echo "3. 'Users' 탭에서 'Add user' 버튼 클릭"
echo ""
echo "4. 다음 정보 입력:"
echo "   - Email: admin@example.com"
echo "   - Password: admin123"
echo "   - Auto Confirm User: ✅ 체크"
echo ""
echo "5. 'Create user' 버튼 클릭"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 완료 후 로그인 테스트:"
echo "   http://localhost:3000/admin/login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
