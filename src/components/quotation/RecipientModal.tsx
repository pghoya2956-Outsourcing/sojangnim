'use client'

/**
 * 견적서 수신자 입력 모달
 * Phase 8: 견적서 출력 템플릿 구현
 */

import { useState, useEffect } from 'react'

interface RecipientModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (recipientName: string) => void
}

export default function RecipientModal({ isOpen, onClose, onSubmit }: RecipientModalProps) {
  const [recipientName, setRecipientName] = useState('')
  const [error, setError] = useState('')

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setRecipientName('')
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
    onSubmit(trimmedName)
  }

  const handleClose = () => {
    setRecipientName('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">견적서 출력</h2>
          <p className="mt-1 text-sm text-gray-600">수신자 정보를 입력해주세요.</p>
        </div>

        {/* 본문 */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <label htmlFor="recipientName" className="block text-sm font-semibold text-gray-900 mb-2">
              수신자명
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
            <p className="mt-2 text-xs text-gray-500">
              회사명, 기관명, 또는 개인명을 입력하세요.
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
