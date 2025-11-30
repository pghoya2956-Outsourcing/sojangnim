import type { Database, Tables, Enums } from './supabase'

// Supabase 자동 생성 타입 기반으로 재정의
export type ProductBadge = Enums<'product_badge'> | null

export type Category = Tables<'categories'>

export type Product = Tables<'products'>

export interface ProductWithCategory extends Product {
  category?: Category | null
}

// JSON 필드 타입 헬퍼 (specs 필드 접근 시 사용)
export type ProductSpecs = Record<string, string> | null

// 제품 스펙을 안전하게 가져오는 헬퍼
export function getProductSpecs(specs: Database['public']['Tables']['products']['Row']['specs']): ProductSpecs {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) {
    return null
  }
  return specs as Record<string, string>
}
