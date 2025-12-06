'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cartStore'
import type { ProductWithCategory } from '@/types/product'

interface ProductCardProps {
  product: ProductWithCategory
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [imageError, setImageError] = useState(false)
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
      toast.error('수량은 1개 이상이어야 합니다.')
      return
    }

    setIsAdding(true)
    addItem(product, quantity)

    // 토스트 알림
    toast.success(`${product.name} ${quantity}개가 장바구니에 담겼습니다.`)

    // 버튼 상태 복원 및 수량 초기화
    setTimeout(() => {
      setIsAdding(false)
      setQuantity(1)
    }, 600)
  }

  return (
    <div
      data-testid="product-card"
      className="bg-white rounded-xl overflow-hidden border border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:border-[#d0d0d0] transition-all duration-300 flex flex-col h-full"
    >
      {/* Product Image - 클릭 시 상세 페이지 */}
      <Link href={`/products/${product.id}`}>
        <div className="w-full h-[160px] sm:h-[182px] bg-gradient-to-br from-[#f8f8f8] to-[#f0f0f0] flex items-center justify-center text-[3rem] sm:text-[3.5rem] cursor-pointer hover:opacity-90 transition-opacity overflow-hidden">
          {product.image_url && !imageError ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#bbb]">
              <span className="text-4xl sm:text-5xl">🔨</span>
              <span className="text-xs mt-1 text-[#999]">이미지 없음</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {product.category && (
          <div className="text-[0.65rem] sm:text-[0.7rem] text-[#888] uppercase tracking-widest mb-1.5 font-semibold">
            {product.category.name}
          </div>
        )}

        {/* Product Name - 클릭 시 상세 페이지 */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-[0.95rem] sm:text-[1.05rem] font-bold text-[#1a1a1a] mb-2 leading-tight hover:text-[#4a4a4a] transition-colors cursor-pointer line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-[0.75rem] sm:text-[0.8rem] text-[#555] leading-relaxed mb-3 flex-1 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Product Specs Box */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="bg-[#f7f7f7] p-2.5 sm:p-3 rounded-lg mb-3 border border-[#eee]">
            {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex justify-between text-[0.7rem] sm:text-[0.75rem] text-[#555] py-0.5">
                <span className="text-[#888]">{key}</span>
                <span className="font-semibold text-[#1a1a1a]">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price - 강조된 타이포그래피 */}
        <div className="mb-3">
          <span className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] tracking-tight">
            {product.price.toLocaleString('ko-KR')}
          </span>
          <span className="text-base sm:text-lg font-bold text-[#1a1a1a]">원</span>
        </div>

        {/* Quantity & Cart */}
        <div className="flex gap-2 items-center pt-3 border-t border-[#eee] mt-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <label htmlFor={`quantity-${product.id}`} className="text-xs sm:text-sm text-[#666] font-medium">
              수량:
            </label>
            <input
              type="number"
              id={`quantity-${product.id}`}
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max="999"
              className="w-14 sm:w-16 px-2 py-1.5 border border-[#e0e0e0] rounded-md text-xs sm:text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent transition-shadow"
            />
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-150 active:scale-[0.96] ${
              isAdding
                ? 'bg-green-500 text-white'
                : 'bg-[#1a1a1a] text-white hover:bg-[#333] hover:shadow-md'
            }`}
          >
            {isAdding ? '✓ 담김' : '🛒 담기'}
          </button>
        </div>
      </div>
    </div>
  )
}
