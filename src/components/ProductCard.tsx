'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import type { ProductWithCategory } from '@/types/product'

interface ProductCardProps {
  product: ProductWithCategory
}

const BADGE_COLORS = {
  '신제품': 'bg-blue-500',
  '베스트': 'bg-red-500',
  '프리미엄': 'bg-purple-500',
  '할인': 'bg-green-500',
} as const

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value > 0 && value <= 999) {
      setQuantity(value)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()

    if (quantity < 1) {
      alert('수량은 1개 이상이어야 합니다.')
      return
    }

    addItem(product, quantity)

    // 간단한 알림
    alert(`${product.name} ${quantity}개가 장바구니에 담겼습니다.`)

    // 수량 초기화
    setQuantity(1)
  }

  return (
    <div
      data-testid="product-card"
      className="bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300 flex flex-col h-full"
    >
      {/* Product Image - 클릭 시 상세 페이지 */}
      <Link href={`/products/${product.id}`}>
        <div className="w-full h-[182px] bg-[#fafafa] flex items-center justify-center text-[3.5rem] cursor-pointer hover:opacity-90 transition-opacity">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            '🔨'
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        {product.category && (
          <div className="text-[0.7rem] text-[#888] uppercase tracking-widest mb-1.5 font-semibold">
            {product.category.name}
          </div>
        )}

        {/* Product Name - 클릭 시 상세 페이지 */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-[1.05rem] font-bold text-[#1a1a1a] mb-2 leading-tight hover:text-[#4a4a4a] transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-[0.8rem] text-[#666] leading-relaxed mb-3 flex-1">
            {product.description}
          </p>
        )}

        {/* Product Specs Box */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="bg-[#f9f9f9] p-2.5 rounded-md mb-3">
            {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex justify-between text-[0.75rem] text-[#555] py-0.5">
                <span className="text-[#888]">{key}</span>
                <span className="font-semibold text-[#1a1a1a]">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="text-xl font-bold text-[#1a1a1a] mb-3">
          {product.price.toLocaleString('ko-KR')}원
        </div>

        {/* Quantity & Cart */}
        <div className="flex gap-2 items-center pt-3 border-t border-[#f0f0f0] mt-auto">
          <div className="flex items-center gap-2">
            <label htmlFor={`quantity-${product.id}`} className="text-sm text-[#666] font-medium">
              수량:
            </label>
            <input
              type="number"
              id={`quantity-${product.id}`}
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max="999"
              className="w-16 px-2 py-1.5 border border-[#e0e0e0] rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent"
            />
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 bg-[#1a1a1a] text-white px-4 py-2 rounded-md hover:bg-black transition-colors font-semibold text-sm"
          >
            🛒 담기
          </button>
        </div>
      </div>
    </div>
  )
}
