'use client'

import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import RecipientModal from '@/components/quotation/RecipientModal'
import QuotationTemplate from '@/components/quotation/QuotationTemplate'
import InquiryModal from '@/components/inquiry/InquiryModal'
import InquirySuccessModal from '@/components/inquiry/InquirySuccessModal'
import { generateQuotationData } from '@/lib/quotation/generator'
import type { QuotationData, RecipientInfo } from '@/types/quotation'

function ProductImage({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f8f8f8] to-[#f0f0f0] text-[#bbb]">
        <span className="text-2xl sm:text-3xl">📦</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  )
}

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)
  const [isInquirySuccessOpen, setIsInquirySuccessOpen] = useState(false)
  const [quotationData, setQuotationData] = useState<QuotationData | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice())

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePrintClick = () => {
    setIsModalOpen(true)
  }

  const handleRecipientSubmit = (recipient: RecipientInfo) => {
    // 1. QuotationData 생성
    const data = generateQuotationData(items, recipient)
    setQuotationData(data)

    // 2. 모달 닫기
    setIsModalOpen(false)

    // 3. 인쇄 상태 활성화 (템플릿 렌더링을 위해)
    setIsPrinting(true)

    // 4. 약간의 지연 후 인쇄 대화상자 열기 (렌더링 완료 대기)
    setTimeout(() => {
      window.print()

      // 5. 인쇄 후 원래 상태로 복원
      setTimeout(() => {
        setIsPrinting(false)
      }, 100)
    }, 100)
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
    <>
      {/* 화면용 UI */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${isPrinting ? 'hidden' : ''}`}>
        <div className="mb-4 sm:mb-6 lg:mb-8 flex items-center justify-between print:hidden">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">장바구니</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium text-xs sm:text-sm active:scale-[0.97] transition-all"
          >
            전체 삭제
          </button>
        </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-2 lg:order-1">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-xl shadow-sm border border-[#e8e8e8] p-4 sm:p-5 lg:p-6"
            >
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                {/* Product Image */}
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden">
                  <ProductImage src={item.product.image_url ?? undefined} alt={item.product.name} />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 hover:text-gray-700 transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    {item.product.price.toLocaleString('ko-KR')}원 / 개
                  </p>
                </div>

                {/* Quantity Control - 모바일에서 세로 배치 */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 print:hidden">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 active:scale-[0.95] transition-all text-sm sm:text-base"
                    >
                      −
                    </button>
                    <span className="w-8 sm:w-12 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 active:scale-[0.95] transition-all text-sm sm:text-base"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Remove */}
                  <div className="flex items-center gap-2 sm:gap-4">
                    <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 whitespace-nowrap">
                      {(item.product.price * item.quantity).toLocaleString('ko-KR')}원
                    </p>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center active:scale-[0.95] transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Print quantity */}
                <div className="hidden print:block">
                  <span className="font-medium">수량: {item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary - 모바일에서는 상단에 표시 */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="bg-white rounded-xl shadow-sm border border-[#e8e8e8] p-4 sm:p-5 lg:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">주문 요약</h2>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                <span>총 제품 수</span>
                <span className="font-medium">{items.length}개</span>
              </div>
              <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                <span>총 수량</span>
                <span className="font-medium">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}개
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-baseline text-gray-900">
                  <span className="font-bold text-sm sm:text-base">소계</span>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      {getTotalPrice.toLocaleString('ko-KR')}
                    </span>
                    <span className="text-base sm:text-lg font-bold">원</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 text-right mt-1">VAT 별도</p>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={handlePrintClick}
                className="w-full bg-[#1a1a1a] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-[#333] hover:shadow-md active:scale-[0.98] transition-all"
              >
                견적서 출력
              </button>
              <button
                onClick={() => setIsInquiryModalOpen(true)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                문의하기
              </button>
              <Link
                href="/products"
                className="block w-full text-center border border-[#e0e0e0] text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-50 hover:border-[#ccc] active:scale-[0.98] transition-all"
              >
                계속 쇼핑하기
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* 수신자 입력 모달 */}
      <RecipientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRecipientSubmit}
      />

      {/* 문의하기 모달 */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        items={items}
        totalAmount={getTotalPrice}
        onSuccess={() => setIsInquirySuccessOpen(true)}
      />

      {/* 문의 완료 모달 */}
      <InquirySuccessModal
        isOpen={isInquirySuccessOpen}
        onClose={() => setIsInquirySuccessOpen(false)}
      />

      {/* 인쇄 전용 템플릿 */}
      {isPrinting && quotationData && (
        <div className="print-only">
          <QuotationTemplate data={quotationData} />
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* 화면용 요소 숨김 */
          header, footer, .print\\:hidden {
            display: none !important;
          }

          /* A4 용지 설정 */
          @page {
            size: A4;
            margin: 5mm;
          }

          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }

          /* 인쇄 전용 템플릿만 표시 */
          .print-only {
            display: block !important;
          }

          /* 페이지 나눔 방지 */
          .quotation-template {
            page-break-inside: avoid;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }

        /* 화면에서는 인쇄 전용 템플릿 숨김 */
        .print-only {
          display: none;
        }

        @media print {
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </>
  )
}
