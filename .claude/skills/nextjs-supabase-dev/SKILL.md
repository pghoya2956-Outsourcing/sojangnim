---
title: "Next.js 14 + Supabase 개발 스킬"
tags: [nextjs, supabase, typescript, patterns]
---

# Next.js 14 + Supabase 개발 스킬

## 사용 시점

Next.js 14 App Router + Supabase 기반 프로젝트에서 반복적인 개발 패턴 적용 시 사용합니다.

---

## 데이터 Fetch 패턴

### Server Component (기본)

```typescript
import { supabase } from '@/lib/supabase/client'

export default async function Page() {
  // 기본 조회
  const { data: items } = await supabase
    .from('table_name')
    .select('*')
    .order('created_at', { ascending: false })

  // 관계 포함 조회 (JOIN)
  const { data: withRelation } = await supabase
    .from('table_name')
    .select('*, relation:relation_table(*)')

  // 필터링
  const { data: filtered } = await supabase
    .from('table_name')
    .select('*')
    .eq('category_id', id)
    .limit(10)

  return <div>{/* JSX */}</div>
}
```

---

## Client Component 패턴

### Hydration 에러 방지 (Zustand persist 사용 시)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/store'

export default function ClientComponent() {
  const data = useStore((state) => state.data)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <div>{/* JSX */}</div>
}
```

---

## Zustand Store 패턴

### Persist 설정

```typescript
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StoreType {
  items: Item[]
  addItem: (item: Item) => void
  removeItem: (id: string) => void
}

export const useStore = create<StoreType>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),
    }),
    {
      name: 'storage-key',  // localStorage key
    }
  )
)
```

---

## 코드 스니펫

### 1. Badge 렌더링

```tsx
const badgeColors: Record<string, string> = {
  '신제품': 'bg-blue-500',
  '베스트': 'bg-red-500',
  '프리미엄': 'bg-purple-500',
  '할인': 'bg-green-500',
}

{badge && (
  <span className={`inline-block ${badgeColors[badge]} text-white text-xs font-bold px-3 py-1 rounded`}>
    {badge}
  </span>
)}
```

### 2. 이미지 Fallback

```tsx
import Image from 'next/image'

<div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
  {imageUrl ? (
    <Image
      src={imageUrl}
      alt={name}
      width={192}
      height={192}
      className="object-cover rounded"
    />
  ) : (
    <span className="text-6xl">📦</span>
  )}
</div>
```

### 3. 금액 포맷팅

```tsx
<p className="text-3xl font-bold text-red-500">
  {price.toLocaleString()}원
</p>
```

### 4. JSONB 필드 렌더링

```tsx
{specs && (
  <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
    {Object.entries(specs).map(([key, value]) => (
      <span key={key} className="bg-gray-100 px-2 py-1 rounded">
        {key}: {value}
      </span>
    ))}
  </div>
)}
```

### 5. 리스트형 레이아웃

```tsx
<div className="flex gap-6 p-6 border-b hover:bg-gray-50 transition cursor-pointer">
  {/* 이미지 영역 */}
  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center flex-shrink-0 rounded">
    {/* 이미지 컴포넌트 */}
  </div>

  {/* 정보 영역 */}
  <div className="flex-1">
    <h3 className="text-2xl font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 mb-3">{category}</p>
    <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

    {/* 추가 정보 */}
    <div className="flex gap-4 text-sm text-gray-500">
      {/* 스펙 등 */}
    </div>
  </div>

  {/* 우측 액션/가격 */}
  <div className="text-right flex flex-col justify-center">
    <p className="text-3xl font-bold text-red-500">{price.toLocaleString()}원</p>
  </div>
</div>
```

---

## TypeScript 타입 정의

### Supabase 테이블 기반

```typescript
// src/types/model.ts

// 기본 타입 (테이블 스키마와 1:1 매칭)
export interface Entity {
  id: string
  name: string
  description: string | null
  created_at: string
}

// 관계 포함 타입
export interface EntityWithRelation extends Entity {
  relation?: Relation | null
}

// Enum 타입
export type BadgeType = '신제품' | '베스트' | '프리미엄' | '할인' | null
```

---

## 에러 처리

### Supabase 쿼리

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')

if (error) {
  console.error('Error fetching data:', error)
  return <ErrorComponent message={error.message} />
}

if (!data || data.length === 0) {
  return <EmptyState />
}

return <DataDisplay data={data} />
```

---

## 최적화 팁

1. **Server Component 우선**: 데이터 fetch는 서버에서
2. **필요한 컬럼만**: `select('id, name, price')` 형태로 명시
3. **Pagination**: `limit()` + `offset()` 사용
4. **이미지**: `next/image` + width/height 필수
5. **Client State**: 최소화, 필요 시만 Zustand persist
