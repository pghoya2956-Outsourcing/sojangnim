---
title: "소장님 - 제품 카탈로그 웹사이트"
tags: [nextjs, supabase, e-commerce, catalog]
---

# 소장님 (Sojangnim)

> **B2B Product Catalog with Quote Generation**
>
> A lightweight product catalog website for generating quotes. Browse products, add to cart, and print professional quotes — no signup required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/sojangnim&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20connection%20details&envLink=https://supabase.com/dashboard/project/_/settings/api)

견적서 출력용 제품 카탈로그 웹사이트. 회원가입 없이 제품을 조회하고 장바구니에 담아 견적서를 출력하는 간소화된 B2B 카탈로그입니다.

![Demo Screenshot](/.playwright-mcp/demo-products-page.png)

## 주요 기능 / Features

| 기능 | Feature | 설명 |
|------|---------|------|
| 📦 제품 카탈로그 | Product Catalog | 카테고리별 제품 조회, 검색, 페이지네이션 |
| 🔍 카테고리 필터링 | Category Filter | 7개 카테고리로 분류 (전동공구, 에어공구, 측정기 등) |
| 🛒 장바구니 | Shopping Cart | 제품 담기, 수량 조절, localStorage 저장 |
| 🖨️ 견적서 출력 | Quote Generation | 장바구니 내역을 견적서로 출력/PDF 저장 |
| 🔐 관리자 페이지 | Admin Dashboard | 제품 CRUD, 이미지 업로드 |
| 🚫 인증 불필요 | No Auth Required | 회원가입/로그인 없이 즉시 사용 |

---

## Quick Deploy (원클릭 배포)

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 가입
2. New Project 생성
3. SQL Editor에서 마이그레이션 실행:
   - `supabase/migrations/` 폴더의 SQL 파일들을 순서대로 실행
   - `supabase/seed.sql` 실행 (샘플 데이터)

### 2. Vercel 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/sojangnim&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20connection%20details&envLink=https://supabase.com/dashboard/project/_/settings/api)

1. 위 버튼 클릭
2. GitHub 저장소 연결
3. 환경 변수 입력:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
4. Deploy 클릭

### 3. 관리자 설정

```sql
-- Supabase SQL Editor에서 실행
INSERT INTO admin_users (email) VALUES ('your-email@example.com');
```

---

## 기술 스택

- **프론트엔드**: Next.js 16.0.0 (App Router), React 19.2.0, TypeScript
- **스타일링**: Tailwind CSS 4.1.16
- **상태관리**: Zustand 5.0.8 (localStorage persist)
- **백엔드**: Supabase PostgreSQL (Docker 로컬)
- **테스트**: Playwright (E2E)
- **배포**: Vercel (예정)

## 시작하기

### 사전 요구사항

- Node.js 20 이상
- Docker (Supabase 로컬 환경)
- npm 또는 pnpm

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone <repository-url>
cd sojangnim

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 Supabase 정보 입력

# 4. Supabase 로컬 환경 시작
supabase start

# 5. 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### Supabase 초기 설정

```bash
# Supabase CLI 설치 (최초 1회)
brew install supabase/tap/supabase  # macOS
# 또는 https://supabase.com/docs/guides/cli

# Supabase 시작
supabase start

# 마이그레이션 적용 (데이터베이스 스키마)
supabase db reset

# Supabase 상태 확인
supabase status
```

**중요**: `supabase status` 명령으로 출력된 값을 `.env.local`에 입력하세요.

## 프로젝트 구조

```
sojangnim/
├── src/
│   ├── app/              # Next.js 페이지 (App Router)
│   │   ├── page.tsx      # 홈 (/)
│   │   ├── products/     # 제품 목록 및 상세
│   │   └── cart/         # 장바구니
│   ├── components/       # 재사용 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CategorySidebar.tsx
│   │   └── AddToCartButton.tsx
│   ├── lib/              # 외부 라이브러리
│   │   └── supabase/     # Supabase 클라이언트
│   ├── store/            # Zustand 상태 관리
│   │   └── cartStore.ts  # 장바구니 store
│   └── types/            # TypeScript 타입 정의
│       └── product.ts
├── supabase/
│   ├── migrations/       # 데이터베이스 마이그레이션
│   └── seed.sql          # 시드 데이터 (7개 카테고리, 24개 제품)
├── tests/
│   └── e2e/              # Playwright E2E 테스트
│       ├── home.spec.ts
│       ├── products.spec.ts
│       └── cart.spec.ts
├── design-mockups/       # HTML 디자인 시안
└── tasks/                # Phase별 작업 문서
```

## 주요 명령어

### 개발

```bash
npm run dev          # 개발 서버 실행 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 서버 실행
npm run lint         # ESLint 실행
```

### 테스트

```bash
npm run test:e2e           # E2E 테스트 실행 (headless)
npm run test:e2e:ui        # UI 모드로 테스트
npm run test:e2e:headed    # 브라우저 보면서 테스트
npm run test:e2e:debug     # 디버그 모드
npm run test:e2e:report    # 테스트 리포트 확인
```

자세한 내용은 [E2E_TESTING.md](./E2E_TESTING.md) 참고

### Supabase

```bash
supabase start        # 로컬 Supabase 시작
supabase stop         # 로컬 Supabase 중지
supabase status       # 상태 확인
supabase db reset     # 데이터베이스 재설정 (마이그레이션 + 시드)
```

## 데이터베이스 스키마

### categories
- `id` (uuid): 카테고리 ID
- `name` (text): 카테고리 이름 (예: "전동공구")
- `slug` (text): URL 슬러그 (예: "power-tools")
- `created_at` (timestamp): 생성일

### products
- `id` (uuid): 제품 ID
- `name` (text): 제품명
- `description` (text): 제품 설명
- `price` (numeric): 가격
- `image_url` (text, nullable): 이미지 URL
- `category_id` (uuid): 카테고리 FK
- `badge` (enum, nullable): 배지 ('신제품', '베스트', '프리미엄', '할인')
- `specs` (jsonb, nullable): 제품 사양 (예: {"전압": "20V", "토크": "180Nm"})
- `created_at` (timestamp): 생성일

## 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# Supabase 로컬 환경
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 프로덕션 환경 (배포 시)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

**주의**: `.env.local` 파일은 Git에 커밋되지 않습니다. `.env.example`을 참고하세요.

## 디자인 시스템

Professional Clean 디자인 컨셉:

- **Primary**: `#1a1a1a` (주 텍스트)
- **Secondary**: `#4a4a4a` (보조 텍스트)
- **Accent**: `#888` (메타 정보)
- **Surface**: `#fafafa` (카드/박스)
- **Border**: `#e0e0e0` (테두리)

배지 색상:
- 신제품: 파란색 (`bg-blue-500`)
- 베스트: 빨간색 (`bg-red-500`)
- 프리미엄: 보라색 (`bg-purple-500`)
- 할인: 녹색 (`bg-green-500`)

자세한 내용은 `design-mockups/03-professional-clean.html` 참고

## 개발 가이드

### 아키텍처 원칙

1. **Server-First**: 데이터 fetch는 Server Component에서
2. **Client-Only When Needed**: 상호작용 필요 시에만 `'use client'`
3. **Type-Safe**: 모든 함수/컴포넌트는 명시적 타입 정의
4. **Responsive**: 모바일 우선, Tailwind breakpoints 활용

### 코딩 컨벤션

- **파일명**: PascalCase (컴포넌트), kebab-case (기타)
- **컴포넌트**: 함수형, Props 인터페이스 명시
- **스타일**: Tailwind CSS, 클래스 순서: layout → spacing → typography → colors
- **Supabase**: `@/lib/supabase/client`에서만 import
- **에러 처리**: 모든 Supabase 쿼리에 에러 핸들링 필수

### Hydration 에러 방지

Zustand persist 사용 시:

```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => { setMounted(true) }, [])
if (!mounted) return null
```

## 배포

### Vercel 배포 (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

환경 변수 설정:
- Vercel Dashboard → Settings → Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key

자세한 내용은 `tasks/05-deployment.md` 참고

## 테스트

### E2E 테스트 (Playwright)

총 30개 테스트:
- 홈페이지: 7개
- 제품 목록/필터링/상세: 13개
- 장바구니: 10개

```bash
# 테스트 실행
npm run test:e2e

# 또는 Claude Code에서
/e2e-test
```

GitHub Actions:
- PR 생성 시 자동 실행
- main 브랜치 푸시 시 실행
- 테스트 리포트 Artifacts 업로드

## 문서

- [CLAUDE.md](./CLAUDE.md) - 프로젝트 개발 원칙
- [E2E_TESTING.md](./E2E_TESTING.md) - E2E 테스트 가이드
- [E2E_TEST_PLAN.md](./E2E_TEST_PLAN.md) - 테스트 계획
- [E2E_TEST_RESULTS.md](./E2E_TEST_RESULTS.md) - 최신 테스트 결과
- [prd.md](./prd.md) - 제품 요구사항 문서
- [tasks/](./tasks/) - Phase별 작업 문서

## 로드맵

### ✅ Phase 1-4: 완료
- Supabase 로컬 환경 구성
- Next.js 프로젝트 설정
- 제품 조회 기능
- 장바구니 기능
- E2E 테스트 자동화

### 🚧 Phase 5: 배포 (진행 중)
- [ ] Supabase Cloud 설정
- [ ] Vercel 배포
- [ ] 환경 변수 설정
- [ ] 도메인 연결

### 🔮 향후 계획
- 검색 기능
- 정렬 기능 (가격, 이름, 최신순)
- 이미지 업로드
- 제품 추천 알고리즘

## 트러블슈팅

### Supabase 연결 실패
```bash
# Supabase 재시작
supabase stop
supabase start

# 상태 확인
supabase status
```

### 빌드 에러
```bash
# 캐시 삭제 후 재빌드
rm -rf .next
npm run build
```

### Hydration 에러
- Client Component에서 localStorage 사용 시 `mounted` 체크 확인
- Server/Client 렌더링 결과가 다른지 확인

## 라이선스

ISC

## 기여

이슈 제보 및 Pull Request 환영합니다!

---

## 제공자 정보

| 항목 | 내용 |
|------|------|
| 제공자 | [회사명 또는 개인명] |
| 이메일 | [contact@example.com] |
| 전화번호 | [010-0000-0000] |
| 사업자등록번호 | [000-00-00000] (선택) |

### 기술 지원

- **이메일 문의**: 영업일 기준 24시간 내 응답
- **긴급 문의**: 호스팅 고객 대상 전화 지원
- **문서**: [기술 문서 링크]

### 환불 정책

- 구축 서비스: 착수 전 100% 환불
- 호스팅 서비스: 30일 내 미사용 시 전액 환불
- 소스코드 판매: 다운로드 전 환불 가능

---

**Made with Claude Code**
