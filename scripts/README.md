---
title: "CI/CD Scripts"
tags: [scripts, ci, automation]
---

# 🔧 CI/CD Scripts

GitHub Actions와 로컬 개발 환경에서 공통으로 사용하는 스크립트 모음입니다.

## 📜 스크립트 목록

### 1. `ci-setup-supabase.sh`

**용도**: Supabase 로컬 환경 시작 및 검증

**동작**:
1. Supabase Docker 컨테이너 시작
2. 서비스 헬스체크 (PostgreSQL, Auth, Storage)
3. 데이터베이스 테이블 검증
4. Storage 버킷 확인

**사용법**:
```bash
./scripts/ci-setup-supabase.sh
```

**출력 예시**:
```
🚀 Starting Supabase for CI...
API URL: http://127.0.0.1:54321
...
⏳ Waiting for services to be ready...
✅ PostgreSQL ready
✅ REST API ready
✅ Auth API ready
✅ Storage API ready
📊 Verifying database setup...
✅ admin_users table exists
✅ products table exists
✅ product-images bucket exists
✅ Supabase is ready for testing!
```

---

### 2. `ci-create-admin.sh`

**용도**: E2E 테스트용 Admin 사용자 생성

**동작**:
1. Supabase Auth API로 `admin@example.com` 생성
2. 비밀번호 `admin123` 설정
3. 이메일 자동 인증
4. 생성 결과 검증

**사용법**:
```bash
./scripts/ci-create-admin.sh
```

**출력 예시**:
```
👤 Creating admin user for E2E tests...
✅ Admin user created: admin@example.com
✅ Admin user verified in Supabase Auth
```

**주의사항**:
- Supabase가 이미 실행 중이어야 합니다
- `admin_users` 테이블에 `admin@example.com`이 있어야 합니다 (마이그레이션/시드로 자동 추가)

---

## 🚀 GitHub Actions 워크플로우

### `.github/workflows/e2e-tests.yml`

```yaml
- name: Start Supabase and verify setup
  run: ./scripts/ci-setup-supabase.sh

- name: Create admin user for tests
  run: ./scripts/ci-create-admin.sh

- name: Run Playwright tests
  run: npm run test:e2e
```

**장점**:
- 워크플로우 파일이 간결함
- 로컬과 CI 환경에서 동일한 스크립트 사용
- 디버깅이 쉬움

---

## 🏠 로컬 개발자 사용법

### E2E 테스트 실행 전

```bash
# 1. Supabase 시작 및 검증
./scripts/ci-setup-supabase.sh

# 2. Admin 사용자 생성
./scripts/ci-create-admin.sh

# 3. E2E 테스트 실행
npm run test:e2e
```

### 자동화된 방법

```bash
# package.json에 추가
{
  "scripts": {
    "test:e2e:setup": "./scripts/ci-setup-supabase.sh && ./scripts/ci-create-admin.sh",
    "test:e2e:full": "npm run test:e2e:setup && npm run test:e2e"
  }
}

# 실행
npm run test:e2e:full
```

---

## 🔐 보안

### API 키에 대한 질문

**Q: 스크립트에 API 키가 하드코딩되어 있는데 괜찮나요?**

**A: 네, 안전합니다!**

이 키들은 **Supabase 로컬 개발용 기본 키**입니다:

```bash
# Anon Key (공개)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Service Role Key (공개)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**왜 안전한가?**
- Supabase 공식 문서에 공개된 키
- `localhost`에서만 작동
- 모든 로컬 Supabase 인스턴스가 동일한 키 사용
- GitHub Actions 러너는 격리된 환경 (외부 접근 불가)

**운영 환경 키는 절대 노출 금지**:
```yaml
# ❌ 절대 하지 마세요
SUPABASE_URL: https://xxx.supabase.co
SUPABASE_KEY: eyJhbGc... # 진짜 운영 키

# ✅ GitHub Secrets 사용
SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
SUPABASE_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

---

## 🛠️ 트러블슈팅

### `permission denied` 에러

```bash
# 실행 권한 부여
chmod +x scripts/ci-*.sh
```

### `docker exec supabase_db_sojangnim: No such container`

```bash
# Supabase가 실행 중인지 확인
supabase status

# 없으면 시작
supabase start
```

### `timeout: command not found` (macOS)

```bash
# GNU coreutils 설치
brew install coreutils

# 또는 스크립트에서 gtimeout 사용
```

### Admin 사용자가 이미 존재

```bash
# 에러는 무시해도 됨 (idempotent)
# 또는 Supabase 재시작
supabase db reset
./scripts/ci-create-admin.sh
```

---

## 📊 CI/CD 파이프라인 흐름

```mermaid
graph LR
    A[코드 푸시] --> B[GitHub Actions 트리거]
    B --> C[의존성 설치]
    C --> D[Playwright 설치]
    D --> E[ci-setup-supabase.sh]
    E --> F[ci-create-admin.sh]
    F --> G[E2E 테스트 실행]
    G --> H{결과}
    H -->|성공| I[리포트 업로드]
    H -->|실패| J[스크린샷 업로드]
    I --> K[PR 코멘트]
    J --> K
```

---

## 📝 참고 문서

- [GitHub Actions E2E Tests](./.github/workflows/e2e-tests.yml)
- [Playwright Config](../playwright.config.ts)
- [E2E Tests](../tests/e2e/)
- [Supabase 로컬 개발](https://supabase.com/docs/guides/cli/local-development)
