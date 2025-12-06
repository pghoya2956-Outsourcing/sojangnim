'use client'

interface InquirySuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InquirySuccessModal({
  isOpen,
  onClose,
}: InquirySuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-8 text-center">
        {/* 성공 아이콘 */}
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* 메시지 */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          문의가 전송되었습니다
        </h2>
        <p className="text-gray-600 mb-6">
          담당자가 빠른 시일 내에 연락드리겠습니다.
        </p>

        {/* 확인 버튼 */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  )
}
