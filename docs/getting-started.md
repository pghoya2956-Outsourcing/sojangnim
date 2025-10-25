---
title: "빠른 시작 가이드"
tags: [getting-started, setup, quickstart]
---

# 🚀 빠른 시작 가이드

5-10분 안에 로컬 개발 환경을 구축하고 프로젝트를 실행합니다.

## 📋 사전 준비

시작하기 전에 다음 프로그램들이 설치되어 있어야 합니다.

### 필수 프로그램

| 프로그램 | 버전 | 확인 방법 | 설치 링크 |
|---------|------|----------|----------|
| **Node.js** | 20.x 이상 | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | 10.x 이상 | `npm --version` | Node.js와 함께 설치됨 |
| **Docker Desktop** | 최신 버전 | `docker --version` | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Git** | 2.x 이상 | `git --version` | [git-scm.com](https://git-scm.com/) |

### 설치 확인

터미널에서 다음 명령어를 실행하여 모두 설치되었는지 확인하세요:

```bash
node --version   # v20.x.x 또는 그 이상
npm --version    # 10.x.x 또는 그 이상
docker --version # Docker version 24.x.x 또는 그 이상
git --version    # git version 2.x.x 또는 그 이상
```

**❗ 중요**: Docker Desktop이 실행 중이어야 합니다. 시스템 트레이에서 Docker 아이콘을 확인하세요.

## 📦 1단계: 프로젝트 클론 및 의존성 설치

### 프로젝트 클론

```bash
# 프로젝트 클론
git clone <repository-url> sojangnim
cd sojangnim
```

### 의존성 설치

```bash
# npm 패키지 설치 (1-2분 소요)
npm install
```

**설치되는 주요 패키지**:
- Next.js 16.0.0 (React 프레임워크)
- React 19.2.0
- Supabase 클라이언트
- Zustand (상태 관리)
- Tailwind CSS 4.1.16
- Playwright (테스트)

## 🗄️ 2단계: Supabase 로컬 환경 설정

Supabase는 프로젝트의 데이터베이스입니다. Docker를 통해 로컬에서 실행합니다.

### Supabase CLI 설치

**macOS** (Homebrew 사용):
```bash
brew install supabase/tap/supabase
```

**Windows** (Scoop 사용):
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux**:
```bash
# NPM으로 설치
npm install -g supabase
```

설치 확인:
```bash
supabase --version
# Supabase CLI 1.x.x 출력되어야 함
```

> 💡 더 자세한 설치 방법은 [Supabase CLI 공식 문서](https://supabase.com/docs/guides/cli)를 참고하세요.

### Supabase 로컬 시작

```bash
# Docker에서 Supabase 시작 (최초 실행 시 3-5분 소요)
supabase start
```

**최초 실행 시** Docker 이미지를 다운로드하므로 시간이 걸립니다. 다음과 같은 메시지가 표시됩니다:

```
Pulling latest images...
Starting Supabase local development setup...

Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**✅ 성공!** 이 정보를 환경 변수 파일에 복사할 것입니다.

> 🔍 더 자세한 내용은 [Supabase 로컬 환경 설정 문서](./supabase/local-setup.md)를 참고하세요.

## 🔑 3단계: 환경 변수 설정

환경 변수는 데이터베이스 연결 정보를 담고 있습니다.

### .env.local 파일 생성

```bash
# 예제 파일을 복사
cp .env.example .env.local
```

### 환경 변수 입력

`.env.local` 파일을 열어서 `supabase start` 명령어로 출력된 값을 입력하세요:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ 주의**:
- `API URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 실제 출력된 전체 키 값을 복사하세요 (매우 긴 문자열)

## 🎨 4단계: 개발 서버 실행

이제 모든 준비가 끝났습니다! Next.js 개발 서버를 실행합니다.

```bash
npm run dev
```

다음과 같은 메시지가 표시됩니다:

```
   ▲ Next.js 16.0.0
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.3s
```

## 🌐 5단계: 브라우저에서 확인

브라우저에서 http://localhost:3000 을 열어보세요!

### 확인할 것들

1. **홈페이지** (`/`)
   - "소장님 제품 카탈로그" 제목 표시
   - 추천 제품 4개 표시
   - 최신 제품 4개 표시

2. **제품 목록** (`/products`)
   - 좌측에 카테고리 사이드바
   - 제품 카드들 (이미지, 이름, 가격)
   - 카테고리 클릭 시 필터링

3. **제품 상세** (제품 카드 클릭)
   - 제품 설명
   - 사양 정보 (전압, 토크 등)
   - "장바구니에 담기" 버튼

4. **장바구니** (`/cart`)
   - 장바구니 아이콘 클릭
   - 담긴 제품 확인
   - "견적서 출력" 버튼

### 문제가 있나요?

- **페이지가 로딩되지 않는다**: Docker Desktop이 실행 중인지 확인
- **제품이 표시되지 않는다**: `supabase status`로 Supabase 상태 확인
- **환경 변수 에러**: `.env.local` 파일의 키 값이 올바른지 확인

👉 [트러블슈팅 문서](./development/troubleshooting.md)에서 더 많은 해결책을 찾아보세요.

## 🗃️ 6단계: Supabase Studio 확인 (선택사항)

Supabase Studio는 데이터베이스를 시각적으로 관리할 수 있는 웹 UI입니다.

브라우저에서 http://localhost:54323 을 열어보세요.

### 확인할 것들

1. **Table Editor**
   - `categories` 테이블: 5개 카테고리 (전동공구, 수공구 등)
   - `products` 테이블: 8개 샘플 제품

2. **SQL Editor**
   - SQL 쿼리 직접 실행 가능

3. **Authentication**
   - 사용자 관리 (현재는 비어있음)

## ✅ 설정 완료!

축하합니다! 🎉 로컬 개발 환경이 준비되었습니다.

### 다음 단계

1. **프로젝트 이해하기**
   - [아키텍처 개요](./architecture/overview.md) 읽기
   - [데이터베이스 스키마](./architecture/database-schema.md) 확인

2. **개발 시작하기**
   - [코딩 컨벤션](./development/coding-conventions.md) 확인
   - [새 기능 추가하기](./development/adding-features.md) 참고

3. **테스트 실행하기**
   - E2E 테스트: `npm run test:e2e`
   - [테스트 가이드](./development/testing.md) 참고

## 🛠️ 주요 명령어 요약

### 개발 서버
```bash
npm run dev          # 개발 서버 시작 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 서버 실행
npm run lint         # 코드 린팅
```

### Supabase
```bash
supabase start       # Supabase 시작
supabase stop        # Supabase 중지
supabase status      # 상태 및 URL 확인
supabase db reset    # 데이터베이스 초기화 (마이그레이션 + 시드 데이터)
```

### 테스트
```bash
npm run test:e2e          # E2E 테스트 실행
npm run test:e2e:ui       # UI 모드로 테스트
npm run test:e2e:headed   # 브라우저 보면서 테스트
```

## 📚 더 알아보기

- [Supabase 로컬 환경 상세 가이드](./supabase/local-setup.md)
- [마이그레이션 가이드](./supabase/migrations.md)
- [컴포넌트 패턴](./development/component-patterns.md)
- [트러블슈팅](./development/troubleshooting.md)

---

**문제가 해결되지 않았나요?** GitHub Issues에 질문을 남겨주세요!
