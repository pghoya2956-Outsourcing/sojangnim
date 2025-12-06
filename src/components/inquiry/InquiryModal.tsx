'use client'

import { useState } from 'react'
import type { CartItem } from '@/store/cartStore'
import type { InquiryItem } from '@/types/inquiry'

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  totalAmount: number
  onSuccess: () => void
}

export default function InquiryModal({
  isOpen,
  onClose,
  items,
  totalAmount,
  onSuccess,
}: InquiryModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerContact, setCustomerContact] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    const trimmedName = customerName.trim()
    const trimmedContact = customerContact.trim()

    if (!trimmedName) {
      setError('이름/회사명을 입력해주세요.')
      return
    }

    if (trimmedName.length < 2) {
      setError('이름/회사명은 최소 2자 이상이어야 합니다.')
      return
    }

    if (!trimmedContact) {
      setError('연락처를 입력해주세요.')
      return
    }

    // 장바구니 품목을 InquiryItem 형식으로 변환
    const inquiryItems: InquiryItem[] = items.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }))

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: trimmedName,
          customer_contact: trimmedContact,
          message: message.trim() || undefined,
          items: inquiryItems,
          total_amount: totalAmount,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '문의 전송에 실패했습니다.')
      }

      // 성공
      onSuccess()
      handleClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '문의 전송에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setCustomerName('')
    setCustomerContact('')
    setMessage('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">문의하기</h2>
          <p className="mt-1 text-sm text-gray-600">
            담당자가 빠른 시일 내에 연락드리겠습니다.
          </p>
        </div>

        {/* 담긴 상품 요약 */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            담긴 상품 ({items.length}개)
          </p>
          <ul className="text-sm text-gray-600 space-y-1 max-h-24 overflow-y-auto">
            {items.map((item) => (
              <li key={item.product.id} className="flex justify-between">
                <span className="truncate mr-2">
                  {item.product.name} x {item.quantity}
                </span>
                <span className="flex-shrink-0 font-medium">
                  {(item.product.price * item.quantity).toLocaleString('ko-KR')}원
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between font-semibold text-gray-900">
            <span>합계</span>
            <span>{totalAmount.toLocaleString('ko-KR')}원</span>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* 이름/회사명 */}
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                이름/회사명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value)
                  setError('')
                }}
                placeholder="예: 홍길동 / OO건설"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {/* 연락처 */}
            <div>
              <label
                htmlFor="customerContact"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                연락처 (전화 또는 이메일) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerContact"
                value={customerContact}
                onChange={(e) => {
                  setCustomerContact(e.target.value)
                  setError('')
                }}
                placeholder="예: 010-1234-5678 / email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                disabled={isSubmitting}
              />
            </div>

            {/* 문의 내용 */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                문의 내용
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="추가 문의사항이 있으시면 입력해주세요."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <p className="text-xs text-gray-500">
              * 표시된 항목은 필수입니다.
            </p>
          </div>

          {/* 푸터 */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>전송 중...</span>
                </>
              ) : (
                '문의 보내기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
