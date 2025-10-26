/**
 * Supabase Storage 헬퍼 함수
 * 제품 이미지 업로드/삭제/검증
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 1. 이미지 파일 체크
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: '이미지 파일만 업로드 가능합니다',
    }
  }

  // 2. SVG 차단 (보안)
  if (file.type === 'image/svg+xml') {
    return {
      valid: false,
      error: 'SVG 파일은 보안상 업로드할 수 없습니다',
    }
  }

  // 3. HEIC/HEIF 차단 (브라우저 미지원)
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    return {
      valid: false,
      error: 'HEIC/HEIF 형식은 지원하지 않습니다. JPG 또는 PNG로 변환 후 업로드하세요',
    }
  }

  // 4. 파일 크기 체크 (5MB)
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2)
    return {
      valid: false,
      error: `파일 크기는 5MB 이하여야 합니다 (현재: ${sizeMB}MB)`,
    }
  }

  // 5. 권장 형식 안내 (경고만, 차단 안 함)
  const recommendedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!recommendedTypes.includes(file.type)) {
    console.warn(`권장하지 않는 형식: ${file.type}. JPG, PNG, WebP, GIF 사용을 권장합니다.`)
  }

  return { valid: true }
}

/**
 * 제품 이미지 업로드
 * @param file - 업로드할 이미지 파일
 * @returns Public URL
 */
export async function uploadProductImage(file: File): Promise<string> {
  // 파일 유효성 검사
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // 브라우저 클라이언트 생성 (쿠키에서 세션 자동 가져옴)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 고유 파일명 생성 (timestamp-filename)
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9.-]/g, '')
  const fileName = `${timestamp}-${sanitizedName}`

  // Supabase Storage 업로드
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    // Supabase 에러 메시지 한글화
    const errorMessage = translateStorageError(error.message)
    throw new Error(errorMessage)
  }

  // Public URL 가져오기
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path)

  return publicUrl
}

/**
 * 제품 이미지 삭제
 * @param imageUrl - 삭제할 이미지의 Public URL
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return

  try {
    // 브라우저 클라이언트 생성
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // URL에서 파일명 추출
    const fileName = extractFileName(imageUrl)
    if (!fileName) {
      console.warn('파일명을 추출할 수 없습니다:', imageUrl)
      return
    }

    // Storage에서 삭제
    const { error } = await supabase.storage
      .from('product-images')
      .remove([fileName])

    if (error) {
      console.error('이미지 삭제 실패:', error)
      throw new Error(translateStorageError(error.message))
    }
  } catch (error) {
    console.error('이미지 삭제 중 오류:', error)
    // 삭제 실패해도 제품 저장/수정은 계속 진행
  }
}

/**
 * URL에서 파일명 추출
 * @param imageUrl - Supabase Storage Public URL
 * @returns 파일명 (예: "1234567890-drill.jpg")
 */
export function extractFileName(imageUrl: string): string | null {
  try {
    // URL 패턴: https://xxx.supabase.co/storage/v1/object/public/product-images/1234-drill.jpg
    const parts = imageUrl.split('/product-images/')
    if (parts.length < 2) {
      return null
    }
    return parts[1]
  } catch (error) {
    console.error('파일명 추출 실패:', error)
    return null
  }
}

/**
 * Supabase Storage 에러 메시지 한글화
 */
function translateStorageError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid file type': '이미지 파일만 업로드 가능합니다',
    'Payload too large': '파일 크기가 너무 큽니다 (최대 5MB)',
    'Unauthorized': '업로드 권한이 없습니다',
    'Bucket not found': '저장소를 찾을 수 없습니다',
    'Object already exists': '같은 이름의 파일이 이미 존재합니다',
  }

  return errorMap[message] || `업로드 실패: ${message}`
}
