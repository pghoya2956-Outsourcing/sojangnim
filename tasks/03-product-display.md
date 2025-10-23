---
title: "Phase 3: 제품 조회 기능 구현"
tags: [product-page, frontend, ui]
---

# Phase 3: 제품 조회 기능 구현

## 목표
홈페이지, 제품 목록, 제품 상세 페이지 구현

---

## 1. 공통 레이아웃 컴포넌트

### 1.1 Header 컴포넌트
**파일**: `src/components/Header.tsx`

```tsx
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-slate-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* 로고 */}
        <Link href="/" className="text-2xl font-bold hover:text-gray-300 transition">
          소장님
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-8">
          <Link href="/" className="hover:text-gray-300 transition">
            홈
          </Link>
          <Link href="/products" className="hover:text-gray-300 transition">
            제품
          </Link>

          {/* 장바구니 아이콘 (Phase 4에서 기능 추가) */}
          <Link
            href="/cart"
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
          >
            <span>🛒</span>
            <span>장바구니</span>
            {/* Phase 4에서 개수 표시 추가 */}
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

### 1.2 Footer 컴포넌트
**파일**: `src/components/Footer.tsx`

```tsx
export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-gray-400">
          <p className="mb-2">© 2025 소장님. All rights reserved.</p>
          <p className="text-sm">견적서 출력용 카탈로그 사이트</p>
        </div>
      </div>
    </footer>
  )
}
```

### 1.3 Root Layout 수정
**파일**: `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '소장님 - 제품 카탈로그',
  description: '견적서 출력용 제품 카탈로그 사이트',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

---

## 2. 홈페이지

### 2.1 홈페이지 구현
**파일**: `src/app/page.tsx`

```tsx
import { supabase } from '@/lib/supabase/client'
import { ProductWithCategory } from '@/types/product'
import Link from 'next/link'
import Image from 'next/image'

export default async function HomePage() {
  // 최신 제품 6개 조회
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })
    .limit(6)

  const badgeColors: Record<string, string> = {
    '신제품': 'bg-blue-500',
    '베스트': 'bg-red-500',
    '프리미엄': 'bg-purple-500',
    '할인': 'bg-green-500',
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-600 text-white rounded-2xl p-16 mb-16 text-center">
        <h1 className="text-5xl font-bold mb-4">소장님에 오신 것을 환영합니다</h1>
        <p className="text-xl mb-8 text-gray-200">
          필요한 제품을 찾아 견적서를 출력하세요
        </p>
        <Link
          href="/products"
          className="inline-block bg-red-500 hover:bg-red-600 px-8 py-4 rounded-lg font-bold text-lg transition"
        >
          제품 보러가기 →
        </Link>
      </section>

      {/* 최신 제품 */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">최신 제품</h2>
          <Link href="/products" className="text-blue-500 hover:underline">
            전체보기 →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product: ProductWithCategory) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden group"
            >
              {/* 이미지 */}
              <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={300}
                    height={192}
                    className="object-cover group-hover:scale-110 transition"
                  />
                ) : (
                  <span className="text-6xl">📦</span>
                )}
              </div>

              {/* 내용 */}
              <div className="p-6">
                {product.badge && (
                  <span
                    className={`inline-block ${
                      badgeColors[product.badge]
                    } text-white text-xs font-bold px-3 py-1 rounded mb-2`}
                  >
                    {product.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {product.category?.name || '미분류'}
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {product.price.toLocaleString()}원
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
```

---

## 3. 제품 목록 페이지

### 3.1 CategorySidebar 컴포넌트
**파일**: `src/components/CategorySidebar.tsx`

```tsx
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface Props {
  currentSlug?: string
}

export default async function CategorySidebar({ currentSlug }: Props) {
  // 카테고리별 제품 개수 조회
  const { data: categories } = await supabase.from('categories').select('*')

  // 각 카테고리별 제품 개수 카운트
  const categoriesWithCount = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)

      return { ...category, count: count || 0 }
    })
  )

  return (
    <aside className="w-64 bg-white rounded-lg shadow-sm p-6 h-fit sticky top-24">
      <h3 className="text-lg font-bold mb-4 pb-3 border-b-2 border-red-500">
        카테고리
      </h3>

      <ul className="space-y-2">
        {/* 전체 보기 */}
        <li>
          <Link
            href="/products"
            className={`block py-2 px-3 rounded transition ${
              !currentSlug
                ? 'bg-red-500 text-white font-bold'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>전체</span>
            </div>
          </Link>
        </li>

        {/* 카테고리 목록 */}
        {categoriesWithCount.map((category) => (
          <li key={category.id}>
            <Link
              href={`/products?category=${category.slug}`}
              className={`block py-2 px-3 rounded transition ${
                currentSlug === category.slug
                  ? 'bg-red-500 text-white font-bold'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{category.name}</span>
                <span className="text-sm text-gray-400">({category.count})</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
```

### 3.2 ProductCard 컴포넌트 (리스트형)
**파일**: `src/components/ProductCard.tsx`

```tsx
import { ProductWithCategory } from '@/types/product'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  product: ProductWithCategory
}

export default function ProductCard({ product }: Props) {
  const badgeColors: Record<string, string> = {
    '신제품': 'bg-blue-500',
    '베스트': 'bg-red-500',
    '프리미엄': 'bg-purple-500',
    '할인': 'bg-green-500',
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div className="flex gap-6 p-6 border-b hover:bg-gray-50 transition cursor-pointer">
        {/* 제품 이미지 */}
        <div className="w-48 h-48 bg-gray-200 flex items-center justify-center flex-shrink-0 rounded">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={192}
              height={192}
              className="object-cover rounded"
            />
          ) : (
            <span className="text-6xl">📦</span>
          )}
        </div>

        {/* 제품 정보 */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Badge */}
            {product.badge && (
              <span
                className={`inline-block ${
                  badgeColors[product.badge]
                } text-white text-xs font-bold px-3 py-1 rounded mb-2`}
              >
                {product.badge}
              </span>
            )}

            <h3 className="text-2xl font-bold text-slate-800 mb-1">
              {product.name}
            </h3>

            <p className="text-sm text-gray-500 mb-3">
              {product.category?.name || '미분류'}
            </p>

            <p className="text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* 스펙 정보 */}
            {product.specs && (
              <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
                {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
                  <span key={key} className="bg-gray-100 px-2 py-1 rounded">
                    {key}: {value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 가격 */}
        <div className="text-right flex flex-col justify-center">
          <p className="text-3xl font-bold text-red-500">
            {product.price.toLocaleString()}원
          </p>
        </div>
      </div>
    </Link>
  )
}
```

### 3.3 제품 목록 페이지
**파일**: `src/app/products/page.tsx`

```tsx
import { supabase } from '@/lib/supabase/client'
import { ProductWithCategory } from '@/types/product'
import CategorySidebar from '@/components/CategorySidebar'
import ProductCard from '@/components/ProductCard'

interface Props {
  searchParams: { category?: string }
}

export default async function ProductsPage({ searchParams }: Props) {
  // 제품 조회 쿼리 구성
  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  // 카테고리 필터링
  if (searchParams.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single()

    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  const { data: products } = await query

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex gap-6">
        {/* 좌측 사이드바 */}
        <CategorySidebar currentSlug={searchParams.category} />

        {/* 제품 목록 */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm">
            {/* 헤더 */}
            <div className="p-6 border-b">
              <h1 className="text-3xl font-bold">
                {searchParams.category
                  ? `카테고리: ${searchParams.category}`
                  : '전체 제품'}
              </h1>
              <p className="text-gray-500 mt-2">
                총 {products?.length || 0}개의 제품
              </p>
            </div>

            {/* 제품 목록 */}
            {products && products.length > 0 ? (
              products.map((product: ProductWithCategory) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="p-16 text-center text-gray-500">
                <p className="text-xl">제품이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 4. 제품 상세 페이지

**파일**: `src/app/products/[id]/page.tsx`

```tsx
import { supabase } from '@/lib/supabase/client'
import { ProductWithCategory } from '@/types/product'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

export default async function ProductDetailPage({ params }: Props) {
  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', params.id)
    .single()

  if (!product) {
    notFound()
  }

  const badgeColors: Record<string, string> = {
    '신제품': 'bg-blue-500',
    '베스트': 'bg-red-500',
    '프리미엄': 'bg-purple-500',
    '할인': 'bg-green-500',
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* 뒤로가기 */}
      <Link href="/products" className="text-blue-500 hover:underline mb-6 inline-block">
        ← 제품 목록으로
      </Link>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* 이미지 */}
          <div className="aspect-square bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={500}
                height={500}
                className="object-cover"
              />
            ) : (
              <span className="text-9xl">📦</span>
            )}
          </div>

          {/* 정보 */}
          <div className="flex flex-col">
            {product.badge && (
              <span
                className={`inline-block ${
                  badgeColors[product.badge]
                } text-white text-sm font-bold px-4 py-2 rounded mb-4 w-fit`}
              >
                {product.badge}
              </span>
            )}

            <h1 className="text-4xl font-bold mb-3">{product.name}</h1>

            <p className="text-gray-500 mb-6 flex items-center gap-2">
              <span>카테고리:</span>
              <Link
                href={`/products?category=${product.category?.slug}`}
                className="text-blue-500 hover:underline"
              >
                {product.category?.name || '미분류'}
              </Link>
            </p>

            <div className="border-t border-b py-6 my-6">
              <p className="text-5xl font-bold text-red-500 mb-2">
                {product.price.toLocaleString()}원
              </p>
            </div>

            {/* 장바구니 담기 버튼 (Phase 4에서 기능 추가) */}
            <button className="w-full bg-red-500 text-white py-4 text-lg font-bold rounded-lg hover:bg-red-600 transition mb-4">
              🛒 장바구니에 담기
            </button>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-bold mb-3 text-lg">제품 설명</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description || '상세 설명이 없습니다.'}
              </p>
            </div>

            {/* 스펙 */}
            {product.specs && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold mb-4 text-lg">제품 사양</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3">
                      <span className="font-medium text-gray-700 min-w-[80px]">
                        {key}:
                      </span>
                      <span className="text-gray-600">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 5. 404 페이지 (선택)

**파일**: `src/app/not-found.tsx`

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">페이지를 찾을 수 없습니다.</p>
        <Link
          href="/"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
```

---

## 6. 완료 체크리스트

### 컴포넌트
- [ ] Header 컴포넌트
- [ ] Footer 컴포넌트
- [ ] CategorySidebar 컴포넌트
- [ ] ProductCard 컴포넌트

### 페이지
- [ ] Root Layout 수정
- [ ] 홈페이지 (`/`)
- [ ] 제품 목록 (`/products`)
- [ ] 제품 상세 (`/products/[id]`)
- [ ] 404 페이지

### 기능
- [ ] 카테고리 필터링 작동
- [ ] Badge 표시
- [ ] 반응형 디자인 확인
- [ ] 이미지 표시 (또는 대체 아이콘)

---

## 7. 테스트 시나리오

1. **홈페이지**
   - http://localhost:3000 접속
   - Hero 섹션과 최신 제품 6개 표시 확인
   - "제품 보러가기" 버튼 클릭

2. **제품 목록**
   - 좌측 사이드바에서 카테고리 클릭
   - URL이 `/products?category=xxx`로 변경되는지 확인
   - 필터링된 제품만 표시되는지 확인

3. **제품 상세**
   - 제품 카드 클릭
   - 상세 정보, 스펙, 가격 정상 표시 확인
   - "뒤로가기" 링크 작동 확인

---

## 다음 단계
✅ Phase 3 완료 후 → 📄 `04-cart-feature.md`로 이동 (장바구니 기능)
