'use client'

import { useState } from 'react'
import type { Inquiry, InquiryStatus, InquiryItem } from '@/types/inquiry'
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUS_COLORS } from '@/types/inquiry'

interface InquiryListProps {
  inquiries: Inquiry[]
}

export default function InquiryList({ inquiries: initialInquiries }: InquiryListProps) {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('상태 변경에 실패했습니다.')
      }

      // 로컬 상태 업데이트
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id ? { ...inq, status: newStatus } : inq
        )
      )

      // 상세 보기도 업데이트
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '오류가 발생했습니다.'
      alert(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      {/* 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                고객 정보
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                품목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                금액
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                접수일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inquiries.map((inquiry) => {
              const items = inquiry.items as InquiryItem[]
              return (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {inquiry.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {inquiry.customer_contact}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {items.length}개 품목
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inquiry.total_amount.toLocaleString('ko-KR')}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        INQUIRY_STATUS_COLORS[inquiry.status]
                      }`}
                    >
                      {INQUIRY_STATUS_LABELS[inquiry.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(inquiry.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 상세 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">문의 상세</h2>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* 내용 */}
            <div className="px-6 py-4 space-y-6">
              {/* 고객 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  고객 정보
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이름/회사</span>
                    <span className="font-medium">{selectedInquiry.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">연락처</span>
                    <span className="font-medium">{selectedInquiry.customer_contact}</span>
                  </div>
                </div>
              </div>

              {/* 문의 내용 */}
              {selectedInquiry.message && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    문의 내용
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                    {selectedInquiry.message}
                  </div>
                </div>
              )}

              {/* 품목 목록 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  문의 품목
                </h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          품목명
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          수량
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          단가
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          금액
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedInquiry.items as InquiryItem[]).map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm">{item.product_name}</td>
                          <td className="px-4 py-2 text-sm text-right">
                            {item.quantity}개
                          </td>
                          <td className="px-4 py-2 text-sm text-right">
                            {item.product_price.toLocaleString('ko-KR')}원
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-medium">
                            {item.subtotal.toLocaleString('ko-KR')}원
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 bg-gray-100">
                        <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-right">
                          합계
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-right">
                          {selectedInquiry.total_amount.toLocaleString('ko-KR')}원
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 상태 변경 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  처리 상태
                </h3>
                <div className="flex gap-2">
                  {(['pending', 'contacted', 'completed', 'cancelled'] as InquiryStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedInquiry.id, status)}
                        disabled={isUpdating || selectedInquiry.status === status}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedInquiry.status === status
                            ? INQUIRY_STATUS_COLORS[status] + ' ring-2 ring-offset-2 ring-gray-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } disabled:opacity-50`}
                      >
                        {INQUIRY_STATUS_LABELS[status]}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 접수일 */}
              <div className="text-sm text-gray-500">
                접수일: {formatDate(selectedInquiry.created_at)}
              </div>
            </div>

            {/* 푸터 */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
