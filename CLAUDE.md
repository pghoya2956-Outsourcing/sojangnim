# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 프로젝트 개요

**소장님**: 견적서 출력용 B2B 제품 카탈로그. 회원가입 없이 제품 조회 → 장바구니 → 견적서 출력.

- **운영 URL**: https://sojangnim.vercel.app
- **기술 스택**: Next.js 16 + React 19 + Supabase + Tailwind CSS 4
- **상태**: 운영 중 (멀티테넌트 지원)

---

## 개발 명령어

```bash
# 로컬 개발
supabase start           # Supabase 로컬 실행 (Docker 필수)
npm run dev              # http://localhost:3000

# 빌드 및 배포
npm run build            # 프로덕션 빌드
npm run lint             # ESLint

# Supabase
supabase db reset        # 마이그레이션 + 시드 재적용
supabase db push         # 운영 DB에 마이그레이션 적용
supabase status          # 연결 정보 확인
```

---

## 아키텍처

### 멀티테넌트 구조

```
┌─────────────────┐     ┌─────────────────┐
│  Vercel App A   │     │  Vercel App B   │
│  (tenant: foo)  │     │  (tenant: bar)  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │  Supabase   │
              │  (1개 DB)   │
              └─────────────┘
```

- **테넌트 식별**: 환경변수 `TENANT_SLUG`
- **데이터 격리**: 모든 테이블에 `tenant_id` FK
- **권한**: `super_admin`(전체), `admin`(소속 테넌트만)

### 핵심 테이블

```sql
tenants       -- 테넌트 정보 (slug, company_info, theme)
products      -- 제품 (tenant_id로 분리)
categories    -- 카테고리 (tenant_id로 분리)
admin_users   -- 관리자 (role: super_admin | admin)
```

### 주요 환경변수

```bash
# 필수 (서버)
TENANT_SLUG=default
SUPABASE_SERVICE_ROLE_KEY=...

# 필수 (클라이언트)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 코드 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 홈 → /products 리다이렉트
│   ├── products/          # 제품 목록/상세
│   ├── cart/              # 장바구니 + 견적서
│   ├── admin/             # 관리자 (인증 필요)
│   │   ├── login/         # 로그인
│   │   ├── products/      # 제품 CRUD
│   │   └── categories/    # 카테고리 CRUD
│   └── api/health/        # 헬스체크
├── components/
│   ├── ui/                # 공통 UI (LoadingSpinner, SubmitButton)
│   ├── admin/             # 관리자 전용
│   └── quotation/         # 견적서 관련
├── lib/
│   ├── supabase/          # Supabase 클라이언트
│   │   ├── client.ts      # 브라우저용 (싱글톤)
│   │   └── server.ts      # 서버용 (테넌트 자동 주입)
│   └── config.ts          # 브랜드/회사 설정
├── store/
│   └── cartStore.ts       # Zustand (localStorage persist)
└── types/                 # TypeScript 타입
```

### Server vs Client Component

```typescript
// Server Component (기본) - 데이터 fetch
import { getServerSupabase } from '@/lib/supabase/server'
const { tenant, raw: supabase } = await getServerSupabase()

// Client Component - 상호작용 필요 시
'use client'
import { useCartStore } from '@/store/cartStore'
```

---

## 주요 패턴

### 테넌트 기반 데이터 조회

```typescript
// src/lib/supabase/server.ts 사용
const { tenant, raw: supabase } = await getServerSupabase()
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('tenant_id', tenant.id)
```

### Hydration 에러 방지

```typescript
// Zustand persist 사용 시 필수
const [mounted, setMounted] = useState(false)
useEffect(() => { setMounted(true) }, [])
if (!mounted) return null
```

### 에러 타입 가드

```typescript
// any 대신 타입 가드 사용
catch (error) {
  const message = error instanceof Error ? error.message : '알 수 없는 오류'
}
```

---

## 배포

### GitHub Actions (태그 기반)

```bash
git tag v1.0.0
git push origin v1.0.0  # → Vercel 자동 배포
```

워크플로우: `.github/workflows/deploy-production.yml`

### Supabase 운영 마이그레이션

```bash
supabase link --project-ref <project-id>
supabase db push
```

---

## 관리자 계정

```sql
-- 로컬 테스트 계정 (supabase/seed.sql)
-- admin@example.com / admin1234 (super_admin)
-- demo@example.com / demo1234 (admin, demo-tools 테넌트)
```

---

## 디자인 시스템

- **Primary**: `#1a1a1a`
- **Surface**: `#fafafa`
- **Border**: `#e0e0e0`
- **버튼 피드백**: `active:scale-[0.97~0.98]`
- **토스트**: sonner 라이브러리
