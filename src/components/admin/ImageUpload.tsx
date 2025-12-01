'use client'

import { useState } from 'react'
import { uploadProductImage, deleteProductImage } from '@/lib/supabase/storage'

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageUrlChange: (url: string | null) => void
  disabled?: boolean
}

export default function ImageUpload({
  currentImageUrl,
  onImageUrlChange,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      // 이미지 업로드
      const publicUrl = await uploadProductImage(file)

      // 상태 업데이트
      setImageUrl(publicUrl)
      onImageUrlChange(publicUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : '업로드에 실패했습니다'
      setError(message)
      console.error('업로드 에러:', err)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!imageUrl) return

    const confirmed = confirm('이미지를 삭제하시겠습니까?')
    if (!confirmed) return

    try {
      // Storage에서 삭제
      await deleteProductImage(imageUrl)

      // 상태 초기화
      setImageUrl(null)
      onImageUrlChange(null)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : '이미지 삭제에 실패했습니다'
      setError(message)
      console.error('삭제 에러:', err)
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
        제품 이미지
      </label>

      {/* 이미지 미리보기 */}
      {imageUrl && (
        <div className="mb-4 relative inline-block">
          <img
            src={imageUrl}
            alt="제품 이미지 미리보기"
            className="w-48 h-48 object-cover rounded-lg border-2 border-[#e0e0e0]"
          />
          <button
            type="button"
            onClick={handleDelete}
            disabled={disabled || uploading}
            className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full hover:bg-red-700 disabled:opacity-50 font-bold text-lg"
            title="이미지 삭제"
          >
            ✕
          </button>
        </div>
      )}

      {/* 파일 선택 */}
      <div className="mb-2">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="block w-full text-sm text-[#666]
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-[#1a1a1a] file:text-white
            hover:file:bg-black
            file:cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* 안내 문구 */}
      <p className="text-xs text-[#888] mb-3">
        JPG, PNG, WebP, GIF 형식 지원 (최대 5MB)
      </p>

      {/* 업로드 중 표시 */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-[#666]">
          <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <span>업로드 중...</span>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          <strong>❌ 오류:</strong> {error}
        </div>
      )}

      {/* 성공 메시지 */}
      {imageUrl && !uploading && !error && (
        <div className="text-green-600 text-sm flex items-center gap-1">
          <span>✓</span>
          <span>이미지가 업로드되었습니다</span>
        </div>
      )}
    </div>
  )
}
