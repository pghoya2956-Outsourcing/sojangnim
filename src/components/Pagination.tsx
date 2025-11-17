'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)

    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }

    router.push(`/products?${params.toString()}`)
  }

  // 페이지 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 5) {
      // 5페이지 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 5페이지 초과
      if (currentPage <= 3) {
        // 현재 페이지가 앞쪽
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        // 현재 페이지가 뒤쪽
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        // 현재 페이지가 중간
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {/* 이전 버튼 */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-[#e0e0e0] rounded-lg hover:bg-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        ◀ 이전
      </button>

      {/* 페이지 번호 */}
      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-[#888]">
              ...
            </span>
          )
        }

        const pageNum = page as number
        const isActive = pageNum === currentPage

        return (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                : 'border-[#e0e0e0] hover:bg-[#fafafa]'
            }`}
          >
            {pageNum}
          </button>
        )
      })}

      {/* 다음 버튼 */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-[#e0e0e0] rounded-lg hover:bg-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        다음 ▶
      </button>
    </div>
  )
}
