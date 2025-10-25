'use client'

import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice())

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-2xl font-bold text-gray-900 mb-4">장바구니가 비어있습니다</p>
          <p className="text-gray-600 mb-8">제품을 둘러보고 장바구니에 담아보세요</p>
          <Link
            href="/products"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            제품 둘러보기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between print:hidden">
        <h1 className="text-3xl font-bold text-gray-900">장바구니</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 font-medium text-sm"
        >
          전체 삭제
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-6">
                {/* Product Image */}
                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    '📦'
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="text-lg font-bold text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-gray-600 text-sm mt-1">
                    {item.product.price.toLocaleString('ko-KR')}원 / 개
                  </p>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Print quantity */}
                <div className="hidden print:block">
                  <span className="font-medium">수량: {item.quantity}</span>
                </div>

                {/* Subtotal */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-gray-900">
                    {(item.product.price * item.quantity).toLocaleString('ko-KR')}원
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-red-600 hover:text-red-700 transition-colors print:hidden"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">주문 요약</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>총 제품 수</span>
                <span className="font-medium">{items.length}개</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>총 수량</span>
                <span className="font-medium">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}개
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-gray-900">
                  <span className="font-bold">소계</span>
                  <span className="text-2xl font-bold">
                    {getTotalPrice.toLocaleString('ko-KR')}원
                  </span>
                </div>
                <p className="text-sm text-gray-500 text-right mt-1">VAT 별도</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePrint}
                className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                견적서 출력
              </button>
              <Link
                href="/products"
                className="block w-full text-center bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                계속 쇼핑하기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          header, footer, .print\\:hidden {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
