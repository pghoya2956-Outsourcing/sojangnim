---
title: "Phase 2: Next.js 프로젝트 설정"
tags: [nextjs, setup, supabase-client]
---

# Phase 2: Next.js 프로젝트 설정

## 목표
Next.js 프로젝트 생성 및 Supabase 연결

---

## 1. Next.js 프로젝트 생성

### 1.1 프로젝트 생성 명령어
```bash
# 현재 위치: /Users/infograb/Workspace/Personal/pghoya2956/sojangnim

# 현재 폴더에 Next.js 프로젝트 생성
npx create-next-app@latest . --typescript --tailwind --app --src-dir
```

### 1.2 설치 옵션 선택
```
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Turbopack for next dev? … No
✔ Would you like to customize the import alias? … No
```

### 1.3 설치 완료 확인
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
# Next.js 기본 페이지가 보이면 성공!
```

---

## 2. Supabase 클라이언트 설치

### 2.1 패키지 설치
```bash
npm install @supabase/supabase-js
```

### 2.2 환경 변수 파일 생성
```bash
# .env.local 파일 생성
touch .env.local
```

### 2.3 환경 변수 입력
`.env.local` 파일에 다음 내용 추가:

```env
# Supabase 연결 정보 (Phase 1에서 확인한 값)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **중요**:
- 실제 값으로 교체하세요!
- `.env.local`은 `.gitignore`에 자동 포함됩니다

---

## 3. 폴더 구조 생성

### 3.1 필요한 폴더 생성
```bash
mkdir -p src/lib/supabase
mkdir -p src/types
mkdir -p src/components
mkdir -p src/store
mkdir -p public/images/products
```

### 3.2 최종 폴더 구조
```
sojangnim/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 홈페이지
│   │   ├── layout.tsx        # 루트 레이아웃
│   │   └── globals.css       # 전역 CSS
│   │
│   ├── components/           # (빈 폴더)
│   ├── lib/supabase/         # (빈 폴더)
│   ├── store/                # (빈 폴더)
│   └── types/                # (빈 폴더)
│
├── public/images/products/   # 제품 이미지
├── .env.local                # Supabase 환경 변수
└── package.json
```

---

## 4. Supabase 클라이언트 설정

### 4.1 Supabase 클라이언트 파일 생성
**파일**: `src/lib/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 5. TypeScript 타입 정의

### 5.1 타입 파일 생성
**파일**: `src/types/product.ts`

```typescript
export type ProductBadge = '신제품' | '베스트' | '프리미엄' | '할인' | null

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  badge: ProductBadge
  specs: Record<string, string> | null
  created_at: string
}

export interface ProductWithCategory extends Product {
  category?: Category | null
}
```

---

## 6. Supabase 연결 테스트

### 6.1 테스트 페이지 작성
**파일**: `src/app/page.tsx`

```tsx
import { supabase } from '@/lib/supabase/client'
import { Product } from '@/types/product'

export default async function Home() {
  // Supabase에서 제품 데이터 가져오기
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(5)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          <h1 className="text-2xl font-bold mb-2">오류 발생</h1>
          <p>{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">제품 목록</h1>

      {products && products.length > 0 ? (
        <div className="space-y-4">
          {products.map((product: Product) => (
            <div key={product.id} className="border rounded-lg p-6 hover:shadow-lg transition">
              {product.badge && (
                <span className="inline-block bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                  {product.badge}
                </span>
              )}
              <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-3">{product.description}</p>
              <p className="text-xl font-bold text-red-500">
                {product.price.toLocaleString()}원
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">제품이 없습니다.</p>
      )}
    </main>
  )
}
```

### 6.2 테스트 실행
```bash
# 개발 서버가 실행 중이면 자동 새로고침
# 실행 중이 아니면:
npm run dev
```

브라우저에서 http://localhost:3000 접속:
- ✅ **성공**: 제품 목록이 화면에 표시됨
- ❌ **실패**: 에러 메시지 확인 (아래 트러블슈팅 참고)

---

## 7. 완료 체크리스트

- [ ] Next.js 프로젝트 생성
- [ ] `@supabase/supabase-js` 설치
- [ ] `.env.local` 환경 변수 설정
- [ ] 폴더 구조 생성
- [ ] `src/lib/supabase/client.ts` 생성
- [ ] `src/types/product.ts` 타입 정의
- [ ] `src/app/page.tsx` 테스트 페이지 작성
- [ ] `npm run dev` 실행 성공
- [ ] 브라우저에서 제품 데이터 표시 확인

---

## 트러블슈팅

### 문제 1: "Cannot find module '@/lib/supabase/client'"
**해결**:
1. 파일 경로 확인: `src/lib/supabase/client.ts`
2. `tsconfig.json`의 `paths` 설정 확인:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```
3. VSCode 재시작

### 문제 2: 제품 데이터가 안 보임
**해결**:
1. `.env.local`의 Supabase URL/KEY 확인
2. Supabase 대시보드에서 RLS 정책 확인
3. 브라우저 콘솔(F12)에서 에러 메시지 확인
4. Phase 1의 샘플 데이터가 제대로 입력되었는지 확인

### 문제 3: "process.env.NEXT_PUBLIC_SUPABASE_URL is undefined"
**해결**:
1. 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)
2. `.env.local` 파일명 확인 (`.env.local.txt` 같은 실수 주의)
3. 환경 변수명 앞에 `NEXT_PUBLIC_` 붙었는지 확인

### 문제 4: "relation 'products' does not exist"
**해결**:
1. Phase 1의 SQL 쿼리를 모두 실행했는지 확인
2. Supabase 대시보드 → Table Editor에서 테이블 존재 확인

---

## Git 커밋 (선택)

```bash
git add .
git commit -m "feat: Next.js 프로젝트 초기 설정 및 Supabase 연결

- Next.js 14 App Router 프로젝트 생성
- Supabase 클라이언트 설정
- TypeScript 타입 정의
- 폴더 구조 구성
- 연결 테스트 완료"
```

---

## 다음 단계
✅ Phase 2 완료 후 → 📄 `03-product-display.md`로 이동
