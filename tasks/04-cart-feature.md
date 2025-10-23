---
title: "Phase 4: 장바구니 기능 구현"
tags: [cart, zustand, state-management]
---

# Phase 4: 장바구니 기능 구현

## 목표
제품을 장바구니에 담고 관리하는 기능 구현 (로컬스토리지 연동)

---

## 1. Zustand 설치

### 1.1 패키지 설치
```bash
npm install zustand
```

---

## 2. 장바구니 Store 생성

### 2.1 장바구니 타입 정의
**파일**: `src/types/cart.ts`

```typescript
import { Product } from './product'

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}
```

### 2.2 Zustand Store 생성
**파일**: `src/store/cart.ts`

```typescript
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartStore, CartItem } from '@/types/cart'
import { Product } from '@/types/product'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // 장바구니에 제품 추가
      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          )

          if (existingItem) {
            // 이미 있으면 수량만 증가
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          } else {
            // 새 제품 추가
            return {
              items: [...state.items, { product, quantity }],
            }
          }
        })
      },

      // 장바구니에서 제품 제거
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      // 수량 변경
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      // 장바구니 비우기
      clearCart: () => {
        set({ items: [] })
      },

      // 총 금액 계산
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },

      // 총 개수 계산
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage', // 로컬스토리지 키 이름
    }
  )
)
```

---

## 3. Header에 장바구니 개수 표시

### 3.1 CartBadge 컴포넌트 생성
**파일**: `src/components/CartBadge.tsx`

```tsx
'use client'

import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CartBadge() {
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const [mounted, setMounted] = useState(false)

  // 하이드레이션 에러 방지
  useEffect(() => {
    setMounted(true)
  }, [])

  const totalItems = mounted ? getTotalItems() : 0

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
    >
      <span>🛒</span>
      <span>장바구니</span>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Link>
  )
}
```

### 3.2 Header 수정
**파일**: `src/components/Header.tsx`

```tsx
import Link from 'next/link'
import CartBadge from './CartBadge'

export default function Header() {
  return (
    <header className="bg-slate-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-gray-300 transition">
          소장님
        </Link>

        <nav className="flex items-center gap-8">
          <Link href="/" className="hover:text-gray-300 transition">
            홈
          </Link>
          <Link href="/products" className="hover:text-gray-300 transition">
            제품
          </Link>
          <CartBadge />
        </nav>
      </div>
    </header>
  )
}
```

---

## 4. 제품 상세 페이지에 "장바구니 담기" 버튼 연결

### 4.1 AddToCartButton 컴포넌트
**파일**: `src/components/AddToCartButton.tsx`

```tsx
'use client'

import { Product } from '@/types/product'
import { useCartStore } from '@/store/cart'
import { useState } from 'react'

interface Props {
  product: Product
}

export default function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000) // 2초 후 메시지 사라짐
  }

  return (
    <div className="space-y-4">
      {/* 수량 선택 */}
      <div className="flex items-center gap-4">
        <label className="font-medium">수량:</label>
        <div className="flex items-center border rounded">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 hover:bg-gray-100"
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center border-x py-2"
            min="1"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-2 hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>

      {/* 장바구니 담기 버튼 */}
      <button
        onClick={handleAddToCart}
        className={`w-full py-4 text-lg font-bold rounded-lg transition ${
          added
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white hover:bg-red-600'
        }`}
      >
        {added ? '✓ 장바구니에 담았습니다!' : '🛒 장바구니에 담기'}
      </button>
    </div>
  )
}
```

### 4.2 제품 상세 페이지 수정
**파일**: `src/app/products/[id]/page.tsx` (일부 수정)

기존 버튼을 아래 컴포넌트로 교체:

```tsx
import AddToCartButton from '@/components/AddToCartButton'

// ... (기존 코드)

// 기존의 <button> 태그를 다음으로 교체:
<AddToCartButton product={product} />
```

---

## 5. 장바구니 페이지

### 5.1 CartItem 컴포넌트
**파일**: `src/components/CartItem.tsx`

```tsx
'use client'

import { CartItem as CartItemType } from '@/types/cart'
import { useCartStore } from '@/store/cart'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  item: CartItemType
}

export default function CartItem({ item }: Props) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const { product, quantity } = item

  return (
    <div className="flex gap-6 p-6 border-b items-center">
      {/* 이미지 */}
      <Link href={`/products/${product.id}`}>
        <div className="w-24 h-24 bg-gray-200 flex items-center justify-center flex-shrink-0 rounded">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={96}
              height={96}
              className="object-cover rounded"
            />
          ) : (
            <span className="text-4xl">📦</span>
          )}
        </div>
      </Link>

      {/* 제품 정보 */}
      <div className="flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-xl font-bold hover:text-blue-500">{product.name}</h3>
        </Link>
        <p className="text-gray-500 text-sm mt-1 line-clamp-1">
          {product.description}
        </p>
        <p className="text-lg font-bold text-red-500 mt-2">
          {product.price.toLocaleString()}원
        </p>
      </div>

      {/* 수량 조절 */}
      <div className="flex items-center border rounded">
        <button
          onClick={() => updateQuantity(product.id, quantity - 1)}
          className="px-4 py-2 hover:bg-gray-100"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) =>
            updateQuantity(product.id, Math.max(1, parseInt(e.target.value) || 1))
          }
          className="w-16 text-center border-x py-2"
          min="1"
        />
        <button
          onClick={() => updateQuantity(product.id, quantity + 1)}
          className="px-4 py-2 hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* 소계 */}
      <div className="text-right w-32">
        <p className="text-xl font-bold">
          {(product.price * quantity).toLocaleString()}원
        </p>
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={() => removeItem(product.id)}
        className="text-red-500 hover:text-red-700 font-medium"
      >
        삭제
      </button>
    </div>
  )
}
```

### 5.2 장바구니 페이지
**파일**: `src/app/cart/page.tsx`

```tsx
'use client'

import { useCartStore } from '@/store/cart'
import CartItem from '@/components/CartItem'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const clearCart = useCartStore((state) => state.clearCart)
  const [mounted, setMounted] = useState(false)

  // 하이드레이션 에러 방지
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-center text-gray-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  const totalPrice = getTotalPrice()

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">장바구니</h1>

      {items.length === 0 ? (
        // 비어있을 때
        <div className="bg-white rounded-lg shadow-lg p-16 text-center">
          <p className="text-xl text-gray-500 mb-6">장바구니가 비어있습니다.</p>
          <Link
            href="/products"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            제품 보러가기
          </Link>
        </div>
      ) : (
        // 제품이 있을 때
        <div className="bg-white rounded-lg shadow-lg">
          {/* 장바구니 아이템 목록 */}
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}

          {/* 하단 요약 */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                전체 삭제
              </button>
              <div className="text-right">
                <p className="text-gray-600 mb-2">총 {items.length}개 제품</p>
                <p className="text-3xl font-bold text-red-500">
                  {totalPrice.toLocaleString()}원
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/products"
                className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-lg text-center font-bold hover:bg-gray-100 transition"
              >
                계속 쇼핑하기
              </Link>
              <button
                className="flex-1 bg-blue-500 text-white py-4 rounded-lg font-bold hover:bg-blue-600 transition"
                onClick={() => alert('견적서 출력 기능은 Phase 5에서 구현됩니다.')}
              >
                📄 견적서 출력
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## 6. 완료 체크리스트

### 설치 및 설정
- [ ] Zustand 설치
- [ ] 장바구니 타입 정의 (`src/types/cart.ts`)
- [ ] Zustand Store 생성 (`src/store/cart.ts`)

### 컴포넌트
- [ ] CartBadge 컴포넌트
- [ ] AddToCartButton 컴포넌트
- [ ] CartItem 컴포넌트

### 페이지 및 기능
- [ ] Header에 장바구니 개수 표시
- [ ] 제품 상세 페이지에 "장바구니 담기" 버튼
- [ ] 장바구니 페이지 (`/cart`)
- [ ] 수량 변경 기능
- [ ] 개별 삭제 기능
- [ ] 전체 삭제 기능
- [ ] 총액 계산
- [ ] 로컬스토리지 자동 저장

---

## 7. 테스트 시나리오

### 7.1 장바구니 담기
1. 제품 상세 페이지 접속
2. 수량 선택 (1~10)
3. "장바구니에 담기" 버튼 클릭
4. "장바구니에 담았습니다!" 메시지 확인
5. Header의 장바구니 개수 증가 확인

### 7.2 장바구니 관리
1. Header의 "장바구니" 클릭
2. 담긴 제품 목록 확인
3. 수량 변경 (+/- 버튼 또는 직접 입력)
4. 총액이 실시간으로 변경되는지 확인
5. "삭제" 버튼으로 개별 제품 제거
6. "전체 삭제" 버튼으로 장바구니 비우기

### 7.3 로컬스토리지 지속성
1. 장바구니에 제품 담기
2. 페이지 새로고침 (F5)
3. 장바구니 내용이 유지되는지 확인
4. 브라우저 닫았다가 다시 열기
5. 여전히 장바구니 내용 유지 확인

---

## 8. 트러블슈팅

### 문제 1: "Hydration failed" 에러
**원인**: 서버와 클라이언트의 초기 상태 불일치
**해결**: `useState`와 `useEffect`로 mounted 상태 관리 (이미 구현됨)

### 문제 2: 로컬스토리지에 저장되지 않음
**해결**:
1. Zustand persist 설정 확인
2. 브라우저 개발자 도구 → Application → Local Storage 확인
3. `cart-storage` 키 존재 여부 확인

### 문제 3: 수량 변경이 안 됨
**해결**:
1. Zustand store의 `updateQuantity` 함수 확인
2. 콘솔에서 에러 메시지 확인
3. 컴포넌트가 'use client' 지시문 포함했는지 확인

---

## 9. 다음 단계

✅ **Phase 4 완료!**

🔜 **Phase 5 (추후 구현)**: 견적서 출력 기능
- PDF 생성 라이브러리 통합
- 견적서 레이아웃 디자인
- 인쇄 최적화

---

## 축하합니다!

기본적인 카탈로그 사이트가 완성되었습니다:
- ✅ 제품 조회
- ✅ 카테고리 필터링
- ✅ 장바구니 기능
- 🔜 견적서 출력 (다음 단계)
