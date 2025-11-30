'use client'

/**
 * 견적서 수신자 입력 모달
 * Phase 8: 견적서 출력 템플릿 구현
 */

import { useState, useEffect } from 'react'
import type { RecipientInfo } from '@/types/quotation'

interface RecipientModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (recipient: RecipientInfo) => void
}

export default function RecipientModal({ isOpen, onClose, onSubmit }: RecipientModalProps) {
  const [recipientName, setRecipientName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setRecipientName('')
      setContactPerson('')
      setPhone('')
      setAddress('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    const trimmedName = recipientName.trim()
    if (!trimmedName) {
      setError('수신자명을 입력해주세요.')
      return
    }

    if (trimmedName.length < 2) {
      setError('수신자명은 최소 2자 이상이어야 합니다.')
      return
    }

    // 제출
    onSubmit({
      name: trimmedName,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    })
  }

  const handleClose = () => {
    setRecipientName('')
    setContactPerson('')
    setPhone('')
    setAddress('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">견적서 출력</h2>
          <p className="mt-1 text-sm text-gray-600">거래처 정보를 입력해주세요.</p>
        </div>

        {/* 본문 */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* 수신자명 (필수) */}
            <div>
              <label htmlFor="recipientName" className="block text-sm font-semibold text-gray-900 mb-2">
                수신자명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="recipientName"
                value={recipientName}
                onChange={(e) => {
                  setRecipientName(e.target.value)
                  setError('')
                }}
                placeholder="예: 경기과학기술대학교"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* 담당자명 */}
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-semibold text-gray-900 mb-2">
                담당자명
              </label>
              <input
                type="text"
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="예: 김철수"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* 연락처 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                연락처
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="예: 031-123-4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* 주소 */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
                주소
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="예: 경기도 시흥시 산기대학로 237"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <p className="text-xs text-gray-500">
              * 표시된 항목은 필수입니다. 나머지는 선택사항입니다.
            </p>
          </div>

          {/* 푸터 */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
            >
              출력하기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
