'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ProductSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  // URL의 search 파라미터를 초기값으로 설정
  useEffect(() => {
    const query = searchParams.get('search') || ''
    setSearchQuery(query)
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams)

    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
      // 검색 시 페이지를 1로 초기화
      params.delete('page')
    } else {
      params.delete('search')
    }

    router.push(`/products?${params.toString()}`)
  }

  const handleClear = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    setSearchQuery('')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제품명으로 검색..."
            className="w-full px-4 py-2.5 border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#1a1a1a] transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#1a1a1a] text-white rounded-lg hover:bg-black transition-colors font-medium"
        >
          🔍 검색
        </button>
      </form>
    </div>
  )
}
