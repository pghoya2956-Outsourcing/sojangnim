---
title: "트러블슈팅 가이드"
tags: [troubleshooting, debugging, errors, solutions]
---

# 🔧 트러블슈팅 가이드

자주 발생하는 문제와 해결 방법을 모았습니다. 문제가 생겼을 때 이 문서를 먼저 확인하세요!

## 🗂️ 목차

- [Supabase 관련](#-supabase-관련)
- [Next.js 개발 서버](#-nextjs-개발-서버)
- [환경 변수](#-환경-변수)
- [Hydration 에러](#-hydration-에러)
- [TypeScript 에러](#-typescript-에러)
- [빌드 에러](#-빌드-에러)
- [Admin 시스템](#-admin-시스템)

---

## 🗄️ Supabase 관련

### ❌ "Cannot connect to the Docker daemon"

**에러 메시지**:
```
Error: Cannot connect to the Docker daemon at unix:///var/run/docker.sock.
Is the docker daemon running?
```

**원인**: Docker Desktop이 실행되지 않음

**해결 방법**:

1. **Docker Desktop 실행 확인**
   - macOS/Windows: 시스템 트레이에서 Docker 아이콘 확인
   - Linux: `sudo systemctl status docker`

2. **Docker Desktop 시작**
   - macOS: Applications에서 Docker.app 실행
   - Windows: 시작 메뉴에서 Docker Desktop 실행
   - Linux: `sudo systemctl start docker`

3. **Supabase 재시작**
   ```bash
   supabase start
   ```

---

### ❌ "Port already in use"

**에러 메시지**:
```
Error: Port 54321 is already allocated
```

**원인**: 다른 프로그램이 Supabase 포트를 사용 중

**해결 방법**:

**방법 1: Supabase 중지 후 재시작**
```bash
supabase stop
supabase start
```

**방법 2: 포트 사용 프로세스 확인 및 종료**

**macOS/Linux**:
```bash
# 포트 54321을 사용하는 프로세스 확인
lsof -i :54321

# 출력 예시:
# COMMAND   PID   USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
# postgres 1234  user    6u  IPv4  0x...      0t0  TCP *:54321

# 프로세스 종료 (PID 1234를 실제 값으로 변경)
kill 1234
```

**Windows**:
```bash
# 포트 사용 확인
netstat -ano | findstr :54321

# 출력 예시:
# TCP    0.0.0.0:54321    0.0.0.0:0    LISTENING    1234

# 프로세스 종료 (PID 1234를 실제 값으로 변경)
taskkill /PID 1234 /F
```

**방법 3: 모든 Docker 컨테이너 중지**
```bash
docker stop $(docker ps -aq)
supabase start
```

---

### ❌ "supabase/config.toml not found"

**에러 메시지**:
```
Error: supabase/config.toml not found
```

**원인**: 프로젝트 루트 디렉토리가 아닌 곳에서 명령어 실행

**해결 방법**:

```bash
# 현재 디렉토리 확인
pwd

# 프로젝트 루트로 이동
cd /path/to/sojangnim

# supabase 폴더가 있는지 확인
ls -la | grep supabase

# supabase 명령어 실행
supabase start
```

---

### ❌ Supabase 연결 실패 (Next.js에서)

**증상**: 페이지에 제품이 표시되지 않음, 콘솔에 네트워크 에러

**원인**: 환경 변수 설정 오류 또는 Supabase가 실행되지 않음

**해결 방법**:

**1단계: Supabase 상태 확인**
```bash
supabase status
```

**정상 출력**:
```
         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
        Status: RUNNING
```

**비정상**:
```
Error: Supabase is not running
```
→ `supabase start` 실행

**2단계: 환경 변수 확인**
```bash
# .env.local 파일 확인
cat .env.local
```

**올바른 형식**:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**체크리스트**:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`이 `http://localhost:54321`인가?
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 완전히 복사되었는가? (매우 긴 문자열)
- [ ] 환경 변수 이름에 오타가 없는가?

**3단계: 개발 서버 재시작**
```bash
# Ctrl+C로 서버 중지
npm run dev
```

---

## 🌐 Next.js 개발 서버

### ❌ "Port 3000 already in use"

**에러 메시지**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**원인**: 포트 3000이 이미 사용 중

**해결 방법**:

**방법 1: 기존 프로세스 종료**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**방법 2: 다른 포트 사용**
```bash
PORT=3001 npm run dev
```

---

### ❌ "Module not found" 에러

**에러 메시지**:
```
Error: Cannot find module '@/components/Header'
```

**원인**: 의존성 미설치 또는 잘못된 import 경로

**해결 방법**:

**1단계: 의존성 재설치**
```bash
# node_modules 삭제
rm -rf node_modules package-lock.json

# 재설치
npm install
```

**2단계: import 경로 확인**
```typescript
// ❌ 잘못된 경로
import Header from '@/component/Header'  // 오타: component → components

// ✅ 올바른 경로
import Header from '@/components/Header'
```

**3단계: 파일 존재 확인**
```bash
ls src/components/Header.tsx
```

---

## 🔑 환경 변수

### ❌ "NEXT_PUBLIC_SUPABASE_URL is not defined"

**에러 메시지** (브라우저 콘솔):
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```

**원인**: `.env.local` 파일이 없거나 환경 변수가 누락됨

**해결 방법**:

**1단계: .env.local 파일 존재 확인**
```bash
ls -la .env.local
```

파일이 없으면:
```bash
cp .env.example .env.local
```

**2단계: 환경 변수 입력**
```bash
# .env.local 파일 편집
vi .env.local
```

**필수 환경 변수**:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**3단계: 개발 서버 재시작**
```bash
npm run dev
```

**⚠️ 주의**: 환경 변수 변경 후 반드시 서버를 재시작해야 합니다!

---

## 💧 Hydration 에러

### ❌ "Hydration failed" 또는 "Text content does not match"

**에러 메시지**:
```
Error: Hydration failed because the initial UI does not match
what was rendered on the server.
```

**원인**: Server와 Client에서 렌더링 결과가 다름 (주로 localStorage 사용 시)

**해결 방법**:

**localStorage 사용 시** (장바구니 등):

```typescript
// ❌ 잘못된 코드 (Hydration 에러 발생)
'use client'

export default function Cart() {
  const { items } = useCartStore()

  return <div>{items.length} items</div>
  // Server: 0 items (localStorage 없음)
  // Client: 3 items (localStorage 있음)
  // → 불일치!
}
```

```typescript
// ✅ 올바른 코드
'use client'

import { useState, useEffect } from 'react'

export default function Cart() {
  const { items } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null  // 또는 로딩 스피너
  }

  return <div>{items.length} items</div>
}
```

**핵심 패턴**:
1. `mounted` 상태로 클라이언트 마운트 확인
2. 마운트 전에는 `null` 또는 로딩 UI 반환
3. 마운트 후 실제 UI 렌더링

---

## 📘 TypeScript 에러

### ❌ "Property does not exist on type"

**에러 메시지**:
```typescript
Property 'name' does not exist on type 'Product'
```

**원인**: 타입 정의가 실제 데이터 구조와 불일치

**해결 방법**:

**1단계: 타입 정의 확인**
```typescript
// src/types/product.ts
export interface Product {
  id: string
  name: string          // ← 이 필드가 정의되어 있는가?
  description: string
  price: number
  // ...
}
```

**2단계: 타입 가져오기 확인**
```typescript
import { Product } from '@/types/product'

// 또는
import type { Product } from '@/types'
```

**3단계: Supabase 응답 타입 확인**
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')  // ← 모든 컬럼 가져오기

// data의 타입은 자동 추론됨
```

---

### ❌ "'children' is missing"

**에러 메시지**:
```typescript
Property 'children' is missing in type '{ title: string }'
```

**원인**: 컴포넌트 Props에 `children` 누락

**해결 방법**:

```typescript
// ❌ 잘못된 타입
interface Props {
  title: string
}

// ✅ children 포함
interface Props {
  title: string
  children: React.ReactNode
}

export default function Layout({ title, children }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  )
}
```

---

## 🏗️ 빌드 에러

### ❌ "Type error: ... is not assignable"

**에러 메시지** (빌드 시):
```
Type error: Type 'string | null' is not assignable to type 'string'
```

**원인**: Nullable 타입 처리 누락

**해결 방법**:

```typescript
// ❌ null 가능성 미처리
const product: Product = await getProduct(id)
return <img src={product.image_url} />  // image_url이 null일 수 있음

// ✅ null 체크
const product: Product = await getProduct(id)
return (
  <img
    src={product.image_url ?? '/default.png'}  // null이면 기본 이미지
    alt={product.name}
  />
)
```

---

### ❌ "Module parse failed: Unexpected token"

**에러 메시지**:
```
Module parse failed: Unexpected token (1:0)
You may need an appropriate loader to handle this file type
```

**원인**: 잘못된 import 또는 문법 오류

**해결 방법**:

**1단계: 파일 확장자 확인**
```typescript
// ❌ 확장자 없음
import { Header } from '@/components/Header'

// ✅ 확장자 포함 (선택사항, 하지만 명확함)
import { Header } from '@/components/Header.tsx'
```

**2단계: 'use client' 지시어 확인**
```typescript
// Client Component는 파일 최상단에 'use client' 필요
'use client'

import { useState } from 'react'
// ...
```

**3단계: 캐시 삭제 후 재빌드**
```bash
rm -rf .next
npm run build
```

---

## 🔐 Admin 시스템

### ❌ Admin 로그인 실패

**증상**: 로그인 버튼 클릭 후 "Invalid login credentials" 에러

**원인**: Admin 사용자가 Supabase Auth에 등록되지 않음

**해결 방법**:

**1단계: Supabase Studio에서 사용자 확인**

http://localhost:54323 → **Authentication** → **Users**

**2단계: Admin 사용자 생성**

**SQL Editor에서 실행**:
```sql
-- Admin 이메일을 화이트리스트에 추가
INSERT INTO admin_users (email) VALUES ('admin@example.com');
```

**3단계: Supabase Auth에 사용자 추가**

**방법 1: Supabase Studio UI**
1. Authentication → Users → **Add user**
2. Email: `admin@example.com`
3. Password: 원하는 비밀번호
4. **Create user**

**방법 2: SQL**
```sql
-- 직접 auth.users에 추가 (권장하지 않음, 복잡함)
-- Supabase Studio UI 사용 권장
```

**4단계: 로그인 테스트**

http://localhost:3000/admin/login

---

### ❌ "new row violates row-level security policy"

**에러 메시지** (제품 추가 시):
```
new row violates row-level security policy for table "products"
```

**원인**: RLS 정책에서 Admin 권한 확인 실패

**해결 방법**:

**1단계: Admin 이메일 확인**
```sql
SELECT * FROM admin_users;
```

로그인한 이메일이 목록에 있는지 확인

**2단계: RLS 정책 확인**
```sql
SELECT * FROM pg_policies WHERE tablename = 'products';
```

**3단계: Server Action 사용 확인**

Admin 페이지에서 제품 추가 시 **반드시 Server Action**을 사용해야 합니다:

```typescript
// ✅ Server Action 사용 (올바름)
import { createProduct } from './actions'

async function handleSubmit(formData: FormData) {
  await createProduct(formData)  // Server에서 실행
}
```

```typescript
// ❌ Client에서 직접 Supabase 호출 (RLS 에러)
const { error } = await supabase
  .from('products')
  .insert([productData])  // Client에서 실행 → RLS 정책 위반
```

---

## 🚀 일반적인 디버깅 팁

### 1. 브라우저 콘솔 확인

**Chrome DevTools**:
- `F12` 또는 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Console** 탭에서 에러 메시지 확인

### 2. 터미널 로그 확인

개발 서버 실행 중인 터미널에서 에러 메시지 확인

### 3. Supabase 로그 확인

```bash
# 전체 로그
supabase logs

# PostgreSQL 로그만
supabase logs --service postgres

# API 로그만
supabase logs --service api
```

### 4. Next.js 빌드로 에러 확인

```bash
npm run build
```

빌드 시 TypeScript 에러, 린트 에러가 모두 표시됩니다.

### 5. 캐시 삭제

```bash
# Next.js 캐시 삭제
rm -rf .next

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# Supabase 재시작
supabase stop
supabase start
```

---

## 📚 추가 도움말

**아직도 문제가 해결되지 않았나요?**

1. [Getting Started 문서](../getting-started.md) 다시 확인
2. [Supabase 로컬 환경 문서](../supabase/local-setup.md) 참고
3. GitHub Issues에 질문 남기기
4. Next.js/Supabase 공식 문서 확인

**유용한 링크**:
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [React 공식 문서](https://react.dev/)

---

**이 문서에 없는 문제가 발생했나요?** GitHub Issues에 공유해주시면 문서를 업데이트하겠습니다!
