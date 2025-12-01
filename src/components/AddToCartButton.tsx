'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/types/product'

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`${product.name} ${quantity}개가 장바구니에 추가되었습니다!`)
  }

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-semibold text-[#1a1a1a]">수량</label>
        <div className="flex items-center border border-[#e0e0e0] rounded-md">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 text-[#666] hover:bg-[#f5f5f5] transition-colors"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center border-x border-[#e0e0e0] py-2 focus:outline-none text-[#1a1a1a] font-semibold"
          />
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-2 text-[#666] hover:bg-[#f5f5f5] transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className="w-full bg-[#1a1a1a] text-white px-8 py-4 rounded-md font-semibold hover:bg-black transition-all duration-100 text-base active:scale-[0.98]"
      >
        장바구니에 담기
      </button>
    </div>
  )
}
