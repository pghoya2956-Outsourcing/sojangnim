---
title: "환경 변수 관리 가이드"
tags: [environment-variables, security, deployment, configuration]
---

# 🔑 환경 변수 관리 가이드

환경 변수를 안전하게 관리하고 환경별로 다르게 설정하는 방법을 배웁니다.

## 📌 환경 변수란?

**환경 변수(Environment Variables)**는 코드 외부에서 설정값을 주입하는 방법입니다.

### 왜 필요한가요?

**❌ 코드에 직접 작성**:
```typescript
// 나쁜 예: 하드코딩
const supabaseUrl = 'https://abcdefgh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**문제점**:
- API 키가 GitHub에 노출 → 보안 위험!
- 환경마다 다른 값 사용 불가
- 키 변경 시 코드 수정 필요

**✅ 환경 변수 사용**:
```typescript
// 좋은 예: 환경 변수
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
```

**장점**:
- 민감 정보 코드와 분리
- 환경별 다른 값 사용 (로컬/스테이징/운영)
- Git에 커밋되지 않음

## 🏗️ Next.js 환경 변수 종류

### 1. 서버 전용 변수

**접근**: 서버에서만 접근 가능

```typescript
// .env.local
DATABASE_PASSWORD=super-secret-password
SERVICE_ROLE_KEY=eyJhbG...secret-key

// 사용 (Server Component 또는 API Route)
const password = process.env.DATABASE_PASSWORD
```

**특징**:
- 클라이언트(브라우저)에 노출되지 않음
- 민감한 정보 저장 (비밀번호, 서비스 키)
- `NEXT_PUBLIC_` 접두사 없음

### 2. 공개 변수 (`NEXT_PUBLIC_`)

**접근**: 서버 + 클라이언트 모두 접근 가능

```typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...public-key

// 사용 (모든 컴포넌트)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
```

**특징**:
- 브라우저에 노출됨 (개발자 도구에서 볼 수 있음)
- 공개 API 주소, 공개 키에만 사용
- 반드시 `NEXT_PUBLIC_` 접두사 필요

### 비교표

| 변수명 | 서버 접근 | 클라이언트 접근 | 용도 예시 |
|--------|----------|----------------|----------|
| `DATABASE_URL` | ✅ | ❌ | DB 연결 문자열 |
| `SERVICE_ROLE_KEY` | ✅ | ❌ | Admin API 키 |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | Supabase 공개 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | Supabase 공개 키 |

## 📂 환경 변수 파일 구조

### 프로젝트 파일들

```
프로젝트/
├── .env.example          # 템플릿 (Git 커밋 ✅)
├── .env.local            # 로컬 개발 (Git 무시 ❌)
├── .env.production       # 운영 (사용 안 함, Vercel에서 관리)
└── .gitignore            # .env*.local 포함
```

### .env.example (템플릿)

**목적**: 다른 개발자에게 필요한 환경 변수 알려주기

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 서버 전용 (선택사항)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**특징**:
- 실제 값 대신 설명 제공
- Git에 커밋됨 ✅
- 새 개발자가 복사해서 사용

### .env.local (로컬 개발)

**목적**: 로컬 개발 환경 설정

```bash
# Supabase 로컬
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**특징**:
- 실제 값 포함
- Git에 커밋되지 않음 ❌ (`.gitignore`에 포함)
- 개발자마다 다를 수 있음

### Vercel (스테이징/운영)

**목적**: 배포 환경 설정

- Vercel Dashboard에서 관리
- 환경별 분리 (Preview / Production)
- 파일이 아닌 UI에서 설정

## 🌍 환경별 환경 변수 설정

### 로컬 환경

**파일**: `.env.local`

```bash
# Supabase 로컬 (Docker)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...로컬키

# 서버 전용 (필요 시)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...로컬서비스키
```

**설정 방법**:
```bash
# 템플릿 복사
cp .env.example .env.local

# 파일 편집
vi .env.local

# supabase status로 값 확인
supabase status
```

### 스테이징 환경 (Preview)

**위치**: Vercel Dashboard → Settings → Environment Variables

**변수**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh-dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...개발키
```

**Environment 선택**: `Preview` 체크

### 프로덕션 환경

**위치**: Vercel Dashboard → Settings → Environment Variables

**변수**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xyz12345-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...운영키
```

**Environment 선택**: `Production` 체크

## 🔐 Vercel에서 환경 변수 설정하기

### 1단계: Vercel 프로젝트 열기

1. https://vercel.com 로그인
2. 프로젝트 선택: `sojangnim`
3. **Settings** 탭 클릭

### 2단계: Environment Variables 메뉴

1. 좌측 메뉴에서 **Environment Variables** 클릭
2. **Add New** 버튼 클릭

### 3단계: 변수 추가

**Supabase URL 추가**:
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://xxx.supabase.co` (Supabase Dashboard에서 복사)
- **Environment**:
  - ✅ Production (운영)
  - ✅ Preview (스테이징)
  - ⬜ Development (로컬은 `.env.local` 사용)
- **Save** 클릭

**Supabase Anon Key 추가**:
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (매우 긴 문자열)
- **Environment**: Production, Preview 체크
- **Save**

### 4단계: 재배포

환경 변수 변경 후 **재배포 필요**:

**자동 재배포**:
```bash
# 아무 변경이나 commit & push
git commit --allow-empty -m "chore: 환경 변수 업데이트 후 재배포"
git push origin main
```

**수동 재배포**:
- Vercel Dashboard → **Deployments** 탭
- 최신 배포 → **⋯** (점 3개) → **Redeploy**

## 🎯 환경별 다른 값 사용하기

### Supabase 프로젝트 2개 전략

**시나리오**: 개발 DB와 운영 DB 분리

**Vercel - Preview 환경**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
```

**Vercel - Production 환경**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
```

**결과**:
- Preview 배포 → 개발 DB 사용
- Production 배포 → 운영 DB 사용

### 코드에서 사용

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**자동으로 환경별 값 사용**:
- 로컬: `http://localhost:54321`
- Preview: `https://dev-project.supabase.co`
- Production: `https://prod-project.supabase.co`

## 🚨 보안 주의사항

### ❌ 절대 하지 말 것

#### 1. service_role 키를 클라이언트에 노출

```typescript
// ❌ 매우 위험!
const NEXT_PUBLIC_SERVICE_ROLE_KEY = 'eyJhbG...'
// 브라우저에 노출되면 누구나 DB 전체 접근 가능!
```

**올바른 방법**:
```typescript
// ✅ 서버 전용 변수 (NEXT_PUBLIC_ 없음)
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY
// Server Component 또는 API Route에서만 사용
```

#### 2. 환경 변수를 Git에 커밋

```bash
# ❌ 절대 커밋하지 말 것!
git add .env.local
git commit -m "환경 변수 추가"
```

**.gitignore 확인**:
```bash
# .gitignore
.env*.local
.env.production
```

#### 3. 실제 키 값을 코드 주석에 작성

```typescript
// ❌ 주석에도 키 노출 금지!
// 개발 키: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### ✅ 보안 베스트 프랙티스

#### 1. 키 타입별 분리

| 키 타입 | 용도 | 노출 허용 | 변수명 접두사 |
|--------|------|----------|--------------|
| **anon key** | 공개 API 접근 | ✅ | `NEXT_PUBLIC_` |
| **service_role key** | Admin API 접근 | ❌ | 없음 |

#### 2. 환경별 다른 키 사용

- 로컬: Docker Supabase 키
- 개발: 개발 프로젝트 키
- 운영: 운영 프로젝트 키

#### 3. 정기적인 키 갱신

- 6개월마다 키 재생성 권장
- Supabase Dashboard → Settings → API → Reset Key

#### 4. .env.example 최신 유지

```bash
# .env.example 업데이트
# 새 환경 변수 추가 시 템플릿도 업데이트

# 실제 값 대신 설명 작성
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🔍 환경 변수 디버깅

### 환경 변수 확인 방법

#### 로컬에서 확인

```typescript
// 임시로 추가 (배포 전 제거!)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) + '...')
```

**터미널 출력**:
```
Supabase URL: http://localhost:54321
Anon Key: eyJhbGciOiJIUzI1NiI...
```

#### Vercel에서 확인

**빌드 로그 확인**:
1. Vercel Dashboard → **Deployments**
2. 최신 배포 클릭
3. **Build Logs** 확인

**런타임 확인**:
1. 배포된 사이트의 브라우저 개발자 도구 열기
2. **Console** 탭
3. `console.log`로 출력한 값 확인

### 자주 발생하는 문제

#### "undefined" 에러

**증상**:
```
Error: NEXT_PUBLIC_SUPABASE_URL is undefined
```

**원인**: 환경 변수가 설정되지 않음

**해결**:
1. `.env.local` 파일 존재 확인
2. 변수명 오타 확인
3. 개발 서버 재시작 (`npm run dev`)

#### Vercel에서 값이 반영되지 않음

**원인**: 환경 변수 변경 후 재배포 안 함

**해결**:
```bash
# 재배포 트리거
git commit --allow-empty -m "chore: redeploy"
git push origin main
```

## 📋 환경 변수 체크리스트

### 로컬 개발

- [ ] `.env.example` 파일 존재
- [ ] `.env.local` 파일 생성
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 설정 (localhost:54321)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
- [ ] `.gitignore`에 `.env*.local` 포함
- [ ] 개발 서버 재시작

### Vercel Preview

- [ ] Vercel Dashboard → Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 추가 (개발 프로젝트)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가 (개발 키)
- [ ] Environment: `Preview` 체크
- [ ] 재배포 확인

### Vercel Production

- [ ] `NEXT_PUBLIC_SUPABASE_URL` 추가 (운영 프로젝트)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가 (운영 키)
- [ ] Environment: `Production` 체크
- [ ] 재배포 및 테스트

## 🎓 실전 팁

### 팁 1: 환경 변수 변경 후 항상 재시작

```bash
# 로컬
# .env.local 변경 후
npm run dev  # Ctrl+C로 중지 후 재시작

# Vercel
# 환경 변수 변경 후
git push origin main  # 또는 Redeploy
```

### 팁 2: anon key는 공개되어도 안전

- Supabase `anon` 키는 RLS 정책으로 보호됨
- 브라우저에 노출되어도 읽기 권한만 가능
- 하지만 `service_role` 키는 절대 노출 금지!

### 팁 3: 환경 변수 이름 일관성 유지

```bash
# ✅ 좋은 네이밍
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_BASE_URL

# ❌ 피해야 할 네이밍
supabaseUrl          # 소문자 (관례 위반)
NEXT_PUBLIC_KEY      # 모호함
API_URL              # 클라이언트에서 사용하려면 NEXT_PUBLIC_ 필요
```

## 📚 다음 단계

- [Vercel 설정](./vercel-setup.md) - 환경 변수 실제로 설정하기
- [첫 배포 가이드](./first-deployment.md) - 환경 변수 포함 배포
- [Supabase Cloud 설정](../supabase/cloud-setup.md) - API 키 확보

---

**다음 읽을 문서**: [Vercel 설정](./vercel-setup.md)
