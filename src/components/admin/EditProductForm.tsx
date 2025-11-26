'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProduct } from '@/app/admin/products/[id]/edit/actions'
import ImageUpload from '@/components/admin/ImageUpload'
import { deleteProductImage } from '@/lib/supabase/storage'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  badge: string | null
  image_url: string | null
  specs: Record<string, string> | null
}

interface Category {
  id: string
  name: string
}

interface EditProductFormProps {
  product: Product
  categories: Category[]
}

export default function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(product.image_url)
  const [previousImageUrl] = useState<string | null>(product.image_url)

  // Specs 초기화
  const initialSpecs = product.specs && typeof product.specs === 'object'
    ? Object.entries(product.specs).map(([key, value]) => ({ key, value }))
    : [{ key: '', value: '' }]

  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    initialSpecs.length > 0 ? initialSpecs : [{ key: '', value: '' }]
  )

  // 폼 기본값
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price?.toString() || '',
    category_id: product.category_id || '',
    badge: product.badge || '',
  })

  const addSpecField = () => {
    setSpecs([...specs, { key: '', value: '' }])
  }

  const removeSpecField = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index))
  }

  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = value
    setSpecs(newSpecs)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    // FormData를 await 전에 먼저 생성 (이벤트 풀링으로 인한 무효화 방지)
    const submitFormData = new FormData(e.currentTarget)

    try {
      // 이미지가 변경되었으면 기존 이미지 삭제
      if (previousImageUrl && previousImageUrl !== imageUrl && imageUrl !== null) {
        await deleteProductImage(previousImageUrl)
      }

      const formData = submitFormData

      // Specs를 JSON 객체로 변환
      const specsObject: Record<string, string> = {}
      specs.forEach(({ key, value }) => {
        if (key && value) {
          specsObject[key] = value
        }
      })

      // Specs를 JSON 문자열로 formData에 추가
      if (Object.keys(specsObject).length > 0) {
        formData.set('specs', JSON.stringify(specsObject))
      }

      await updateProduct(product.id, formData)
      // redirect가 호출되므로 여기는 실행되지 않음
    } catch (error: any) {
      // NEXT_REDIRECT는 정상적인 redirect이므로 무시
      if (error.message !== 'NEXT_REDIRECT') {
        alert('제품 수정 실패: ' + error.message)
        setLoading(false)
      }
    }
  }

  return (
    <div className="max-w-[800px] mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">제품 수정</h1>
        <p className="text-[#666]">제품 정보를 수정하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 space-y-6">
        {/* 제품명 */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-[#1a1a1a] mb-2">
            제품명 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#1a1a1a]"
            placeholder="예: 프로페셔널 임팩트 드라이버"
          />
        </div>

        {/* 설명 */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-[#1a1a1a] mb-2">
            제품 설명
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#1a1a1a]"
            placeholder="제품에 대한 상세 설명을 입력하세요"
          />
        </div>

        {/* 가격 */}
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-[#1a1a1a] mb-2">
            가격 (원) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#1a1a1a]"
            placeholder="298000"
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-semibold text-[#1a1a1a] mb-2">
            카테고리
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#1a1a1a]"
          >
            <option value="">선택 안 함</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 뱃지 */}
        <div>
          <label htmlFor="badge" className="block text-sm font-semibold text-[#1a1a1a] mb-2">
            뱃지
          </label>
          <select
            id="badge"
            name="badge"
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            className="w-full px-4 py-3 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#1a1a1a]"
          >
            <option value="">선택 안 함</option>
            <option value="신제품">신제품</option>
            <option value="베스트">베스트</option>
            <option value="프리미엄">프리미엄</option>
            <option value="할인">할인</option>
          </select>
        </div>

        {/* 이미지 업로드 */}
        <ImageUpload
          currentImageUrl={imageUrl}
          onImageUrlChange={setImageUrl}
          disabled={loading}
        />
        <input type="hidden" name="image_url" value={imageUrl || ''} />

        {/* 제품 사양 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-[#1a1a1a]">
              제품 사양
            </label>
            <button
              type="button"
              onClick={addSpecField}
              className="text-sm text-[#1a1a1a] hover:underline"
            >
              + 사양 추가
            </button>
          </div>
          <div className="space-y-2">
            {specs.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => updateSpec(index, 'key', e.target.value)}
                  className="flex-1 px-4 py-2 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#1a1a1a]"
                  placeholder="항목명 (예: 전압)"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateSpec(index, 'value', e.target.value)}
                  className="flex-1 px-4 py-2 border border-[#e0e0e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] text-[#1a1a1a]"
                  placeholder="값 (예: 20V)"
                />
                {specs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecField(index)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#1a1a1a] text-white px-6 py-3 rounded-md hover:bg-black transition-colors font-semibold disabled:opacity-50"
          >
            {loading ? '저장 중...' : '수정 완료'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-[#e0e0e0] rounded-md hover:bg-[#f5f5f5] transition-colors font-semibold text-[#1a1a1a]"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}
