---
title: "Supabase 로컬 환경 설정"
tags: [supabase, local, setup, docker, database]
---

# 🗄️ Supabase 로컬 환경 설정

Supabase를 Docker로 로컬에서 실행하는 완벽 가이드입니다. 초보자도 쉽게 따라할 수 있도록 상세히 설명합니다.

## 📌 Supabase란?

**Supabase**는 오픈소스 Firebase 대체재로, PostgreSQL 데이터베이스를 기반으로 합니다.

**이 프로젝트에서 Supabase의 역할**:
- 📦 제품 정보 저장 (`products` 테이블)
- 🏷️ 카테고리 정보 저장 (`categories` 테이블)
- 🔐 Admin 인증 (Supabase Auth)
- 🔒 데이터 보안 (RLS 정책)

**로컬 Supabase**는 Docker를 통해 실제 Supabase와 동일한 환경을 내 컴퓨터에서 실행합니다.

```mermaid
graph LR
    A[Next.js 앱<br/>localhost:3000] --> B[Supabase API<br/>localhost:54321]
    B --> C[PostgreSQL<br/>localhost:54322]
    D[Supabase Studio<br/>localhost:54323] --> C
```

## 🚀 1단계: Docker Desktop 설치 및 실행

Supabase는 Docker 컨테이너로 실행됩니다.

### Docker Desktop 설치

| OS | 다운로드 링크 |
|----|-------------|
| macOS | [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) |
| Windows | [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) |
| Linux | [Docker Engine](https://docs.docker.com/engine/install/) |

### 설치 확인

```bash
docker --version
# Docker version 24.x.x 이상이면 OK
```

### Docker Desktop 실행

**중요**: Supabase를 시작하기 전에 Docker Desktop이 **반드시 실행 중**이어야 합니다!

- **macOS/Windows**: 시스템 트레이에서 Docker 아이콘 확인
- **Linux**: `sudo systemctl start docker`

## 📦 2단계: Supabase CLI 설치

Supabase CLI는 로컬 Supabase를 관리하는 명령줄 도구입니다.

### macOS (Homebrew)

```bash
brew install supabase/tap/supabase
```

### Windows (Scoop)

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Linux / 기타

```bash
# NPM으로 전역 설치
npm install -g supabase
```

### 설치 확인

```bash
supabase --version
# Supabase CLI 1.x.x 출력되면 성공
```

## 🎬 3단계: Supabase 시작

프로젝트 루트 디렉토리에서 실행하세요.

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/sojangnim

# Supabase 시작
supabase start
```

### 최초 실행 시

**Docker 이미지 다운로드**로 3-5분 정도 소요됩니다. 다음과 같은 메시지가 표시됩니다:

```
Pulling latest images...
Pulling supabase/postgres:15.1.0.117
Pulling supabase/gotrue:v2.99.0
Pulling postgrest/postgrest:v11.2.2
...
```

### 성공 메시지

```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**✅ 성공!** 이 정보를 메모해두세요.

## 🔑 4단계: 환경 변수 설정

### .env.local 파일 생성

```bash
# 예제 파일 복사
cp .env.example .env.local
```

### 환경 변수 입력

`.env.local` 파일을 편집기로 열어서 다음 값을 입력합니다:

```bash
# .env.local

# Supabase 로컬 환경
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**매핑 관계**:
- `API URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**⚠️ 주의사항**:
- `anon key`는 매우 긴 문자열입니다 (200자 이상)
- 전체 키를 복사하세요! 일부만 복사하면 연결 에러 발생
- `.env.local` 파일은 Git에 커밋되지 않습니다

## 🏗️ 5단계: 데이터베이스 초기화

Supabase가 실행 중이면 자동으로 마이그레이션이 적용됩니다.

### 수동으로 초기화하기

```bash
supabase db reset
```

**이 명령어는**:
1. 기존 데이터베이스를 삭제
2. `supabase/migrations/*.sql` 파일을 순서대로 실행
3. `supabase/seed.sql` 시드 데이터 삽입

### 확인

```bash
supabase status
```

출력:
```
         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
        Status: RUNNING
```

`Status: RUNNING` 이면 정상입니다!

## 🎨 6단계: Supabase Studio 둘러보기

Supabase Studio는 데이터베이스를 시각적으로 관리하는 웹 UI입니다.

### Studio 열기

브라우저에서 http://localhost:54323 접속

### Table Editor

좌측 메뉴에서 **Table Editor** 클릭

**확인할 테이블**:

#### 1. categories 테이블

5개의 카테고리가 있어야 합니다:

| id | name | slug | created_at |
|----|------|------|------------|
| uuid | 전동공구 | power-tools | 2025-01-24... |
| uuid | 수공구 | hand-tools | 2025-01-24... |
| uuid | 측정공구 | measuring-tools | 2025-01-24... |
| uuid | 안전용품 | safety-equipment | 2025-01-24... |
| uuid | 작업대 | workbenches | 2025-01-24... |

#### 2. products 테이블

8개의 샘플 제품이 있어야 합니다:

| name | price | category_id | badge |
|------|-------|-------------|-------|
| 무선 드릴 세트 | 180000 | (전동공구) | 신제품 |
| 전동 임팩트 드라이버 | 250000 | (전동공구) | 베스트 |
| ... | ... | ... | ... |

**JSONB 필드 `specs` 확인**:

제품을 클릭하면 `specs` 필드에 JSON 형식으로 사양이 저장되어 있습니다:

```json
{
  "전압": "20V",
  "토크": "180Nm",
  "배터리": "2.0Ah"
}
```

### SQL Editor

**SQL 쿼리 실행해보기**:

```sql
-- 전체 제품 조회
SELECT * FROM products;

-- 카테고리별 제품 수
SELECT
  c.name as category,
  COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name;
```

**Run** 버튼을 클릭하면 결과가 표시됩니다.

### Authentication

**Users** 탭을 클릭하면 현재는 비어있습니다.

Admin 사용자는 나중에 추가할 것입니다. ([Admin 시스템 문서](./admin-system.md) 참고)

## 🔧 주요 명령어

### 시작/중지

```bash
# Supabase 시작
supabase start

# Supabase 중지
supabase stop

# 상태 확인
supabase status
```

### 데이터베이스 관리

```bash
# 데이터베이스 초기화 (마이그레이션 + 시드 데이터)
supabase db reset

# 현재 DB 상태와 마이그레이션 비교
supabase db diff

# 새 마이그레이션 생성
supabase migration new <migration_name>
```

### 로그 확인

```bash
# 전체 로그 보기
supabase logs

# 특정 서비스 로그만 보기
supabase logs --service postgres
supabase logs --service api
```

## 📊 Supabase 서비스 포트 정리

Supabase 로컬 환경은 여러 서비스로 구성됩니다:

| 서비스 | 포트 | 용도 | URL |
|--------|------|------|-----|
| **API** | 54321 | REST API, Auth | http://localhost:54321 |
| **DB** | 54322 | PostgreSQL | postgresql://postgres:postgres@localhost:54322/postgres |
| **Studio** | 54323 | 관리 UI | http://localhost:54323 |
| **Inbucket** | 54324 | 이메일 테스트 | http://localhost:54324 |
| **Kong** | 54320 | API Gateway | (내부용) |

**Next.js 앱은** `54321` 포트의 API만 사용합니다.

## 🐛 문제 해결

### "Cannot connect to the Docker daemon"

**원인**: Docker Desktop이 실행되지 않음

**해결**:
1. Docker Desktop 실행
2. 시스템 트레이에서 Docker 아이콘 확인
3. `supabase start` 재실행

### "Port already in use"

**원인**: 다른 프로그램이 Supabase 포트를 사용 중

**해결**:

```bash
# 실행 중인 Supabase 중지
supabase stop

# 포트 사용 프로세스 확인 (macOS/Linux)
lsof -i :54321
lsof -i :54322
lsof -i :54323

# Windows
netstat -ano | findstr :54321

# 프로세스 종료 후 재시작
supabase start
```

### "Migrations failed"

**원인**: 마이그레이션 SQL 파일에 오류

**해결**:

```bash
# 로그 확인
supabase logs --service postgres

# 데이터베이스 완전 초기화
supabase db reset
```

### 연결 에러 (Next.js 앱에서)

**원인**: 환경 변수 설정 오류

**체크리스트**:
1. `.env.local` 파일이 프로젝트 루트에 있는가?
2. `NEXT_PUBLIC_SUPABASE_URL`이 정확한가? (`http://localhost:54321`)
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 완전히 복사되었는가?
4. `supabase status`로 Supabase가 실행 중인가?

**해결**:

```bash
# Supabase 재시작
supabase stop
supabase start

# 환경 변수 다시 확인
cat .env.local

# 개발 서버 재시작
npm run dev
```

## 🔄 데이터베이스 리셋하기

개발 중 데이터베이스를 초기 상태로 되돌리고 싶을 때:

```bash
supabase db reset
```

**주의**: 로컬 데이터가 모두 삭제되고 시드 데이터로 초기화됩니다!

## 🎓 추가 학습

### Supabase 개념 이해하기

- **PostgreSQL**: 관계형 데이터베이스 (MySQL과 유사)
- **PostgREST**: PostgreSQL을 자동으로 REST API로 변환
- **GoTrue**: 인증 서비스 (JWT 기반)
- **RLS (Row Level Security)**: 행 수준 보안 정책

### 다음 단계

1. [마이그레이션 가이드](./migrations.md) - DB 변경 관리
2. [RLS 정책](./rls-policies.md) - 데이터 보안
3. [Admin 시스템](./admin-system.md) - 관리자 인증

## 📚 참고 자료

- [Supabase CLI 공식 문서](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [PostgreSQL 튜토리얼](https://www.postgresql.org/docs/current/tutorial.html)

---

**다음 읽을 문서**: [마이그레이션 가이드](./migrations.md)
